// cypress/e2e/dashboard.cy.js
// Pruebas del dashboard principal

describe('Dashboard', () => {
  beforeEach(() => {
    // Intercepta la carga de citas para el dashboard
    cy.intercept('GET', '**/api/appointments*', {
      statusCode: 200,
      body: [],
    }).as('getAppointments')

    // Simula login exitoso antes de cada prueba
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: '1', name: 'María López', email: 'maria@test.com', role: 'user' },
      },
    }).as('login')

    cy.visit('/login')
    cy.get('input[name="email"]').type('maria@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@login')
    cy.url().should('include', '/dashboard')
  })

  it('muestra el saludo con el nombre del usuario', () => {
    cy.contains('Bienvenido, María López').should('be.visible')
  })

  it('muestra las 3 tarjetas de navegación', () => {
    cy.contains('Mis mascotas').should('be.visible')
    cy.contains('Mis citas').should('be.visible')
    cy.contains('Clínicas').should('be.visible')
  })

  it('navega a /pets al hacer click en Mis mascotas', () => {
    cy.contains('Mis mascotas').click()
    cy.url().should('include', '/pets')
  })

  it('navega a /appointments al hacer click en Mis citas', () => {
    cy.contains('Mis citas').click()
    cy.url().should('include', '/appointments')
  })

  it('navega a /clinics al hacer click en Clínicas', () => {
    cy.contains('Clínicas').click()
    cy.url().should('include', '/clinics')
  })

  it('muestra mensaje cuando no hay citas próximas', () => {
    cy.wait('@getAppointments')
    cy.contains('No tienes citas programadas próximamente').should('be.visible')
  })
})