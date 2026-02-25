// cypress/e2e/appointments.cy.js
// Pruebas de gestión de citas veterinarias

const mockPets = [
  { id: '1', name: 'Firulais', species: 'perro' },
]

const mockClinics = [
  { id: '1', name: 'Clínica VetCentral', city: 'Bogotá', address: 'Calle 10 #5-20', latitude: 4.6, longitude: -74.08, avg_rating: 4.5 },
]

const mockAppointments = [
  {
    id: '1',
    pet_id: '1',
    clinic_id: '1',
    reason: 'Vacunación',
    appointment_date: new Date(Date.now() + 86400000 * 3).toISOString(), // en 3 días
    status: 'scheduled',
    pets: { name: 'Firulais' },
    clinics: { name: 'Clínica VetCentral' },
  },
]

describe('Citas', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'user' },
      },
    }).as('login')

    cy.intercept('GET', '**/api/appointments*', { statusCode: 200, body: mockAppointments }).as('getAppointments')
    cy.intercept('GET', '**/api/pets*', { statusCode: 200, body: mockPets }).as('getPets')
    cy.intercept('GET', '**/api/clinics*', { statusCode: 200, body: mockClinics }).as('getClinics')

    cy.visit('/login')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@login')
    cy.visit('/appointments')
    cy.wait('@getAppointments')
  })

  // ── Listado ────────────────────────────────────────────────────────────────

  it('muestra las citas existentes', () => {
    cy.contains('Vacunación').should('be.visible')
    cy.contains('Firulais').should('be.visible')
  })

  it('muestra el estado de la cita como Programada', () => {
    cy.contains('Programada').should('be.visible')
  })

  it('muestra mensaje cuando no hay citas', () => {
    cy.intercept('GET', '**/api/appointments*', { statusCode: 200, body: [] }).as('emptyAppointments')
    cy.visit('/appointments')
    cy.wait('@emptyAppointments')
    cy.contains('No tienes citas').should('be.visible')
  })

  // ── Wizard nueva cita: paso 1 ──────────────────────────────────────────────

  it('abre el wizard al hacer click en + Nueva cita', () => {
    cy.contains('+ Nueva cita').click()
    cy.contains('Información de la cita').should('be.visible')
  })

  it('paso 1 muestra los selectores de mascota y motivo', () => {
    cy.contains('+ Nueva cita').click()
    cy.wait('@getPets')
    cy.contains('Mascota').should('be.visible')
    cy.contains('Motivo').should('be.visible')
  })

  it('no avanza al paso 2 sin seleccionar mascota', () => {
    cy.contains('+ Nueva cita').click()
    cy.wait('@getPets')
    cy.contains('Siguiente').click()
    // Debe permanecer en el paso 1
    cy.contains('Información de la cita').should('be.visible')
  })

  // ── Cancelar cita ─────────────────────────────────────────────────────────

  it('cancela una cita al hacer click en Cancelar cita', () => {
    cy.intercept('PUT', '**/api/appointments/1*', {
      statusCode: 200,
      body: { ...mockAppointments[0], status: 'cancelled' },
    }).as('cancelAppointment')

    cy.intercept('GET', '**/api/appointments*', {
      statusCode: 200,
      body: [{ ...mockAppointments[0], status: 'cancelled' }],
    }).as('getUpdated')

    cy.on('window:confirm', () => true)
    cy.contains('Vacunación').parents('li, div').first().contains('Cancelar').click()

    cy.wait('@cancelAppointment')
    cy.contains('Cancelada').should('be.visible')
  })
})