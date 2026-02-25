// cypress/e2e/clinics.cy.js
// Pruebas de la página de clínicas

const mockClinics = [
  {
    id: '1',
    name: 'Clínica VetCentral',
    city: 'Bogotá',
    address: 'Calle 10 #5-20',
    latitude: 4.6,
    longitude: -74.08,
    avg_rating: 4.5,
  },
  {
    id: '2',
    name: 'Veterinaria AnimaCare',
    city: 'Medellín',
    address: 'Carrera 50 #30-10',
    latitude: 6.25,
    longitude: -75.56,
    avg_rating: 3.8,
  },
]

const mockReviews = [
  { id: '1', clinic_id: '1', rating: 5, comment: 'Excelente atención', user_id: '1' },
]

describe('Clínicas', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'user' },
      },
    }).as('login')

    cy.intercept('GET', '**/api/clinics*', { statusCode: 200, body: mockClinics }).as('getClinics')

    cy.visit('/login')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@login')
    cy.visit('/clinics')
    cy.wait('@getClinics')
  })

  // ── Listado ────────────────────────────────────────────────────────────────

  it('muestra las clínicas disponibles', () => {
    cy.contains('Clínica VetCentral').should('be.visible')
    cy.contains('Veterinaria AnimaCare').should('be.visible')
  })

  it('muestra la ciudad de cada clínica', () => {
    cy.contains('Bogotá').should('be.visible')
    cy.contains('Medellín').should('be.visible')
  })

  it('muestra la calificación promedio', () => {
    cy.contains('4.5').should('be.visible')
    cy.contains('3.8').should('be.visible')
  })

  it('muestra mensaje cuando no hay clínicas', () => {
    cy.intercept('GET', '**/api/clinics*', { statusCode: 200, body: [] }).as('emptyClinics')
    cy.visit('/clinics')
    cy.wait('@emptyClinics')
    cy.contains('No hay clínicas').should('be.visible')
  })

  // ── Ver reseñas ────────────────────────────────────────────────────────────

  it('muestra las reseñas al hacer click en una clínica', () => {
    cy.intercept('GET', '**/api/clinics/1/reviews*', {
      statusCode: 200,
      body: mockReviews,
    }).as('getReviews')

    cy.contains('Clínica VetCentral').click()
    cy.wait('@getReviews')
    cy.contains('Excelente atención').should('be.visible')
  })

  // ── Agregar reseña ─────────────────────────────────────────────────────────

  it('permite agregar una reseña a una clínica', () => {
    cy.intercept('GET', '**/api/clinics/1/reviews*', {
      statusCode: 200,
      body: mockReviews,
    }).as('getReviews')

    cy.intercept('POST', '**/api/clinics/1/reviews*', {
      statusCode: 201,
      body: { id: '2', clinic_id: '1', rating: 4, comment: 'Muy buena atención', user_id: '1' },
    }).as('postReview')

    cy.contains('Clínica VetCentral').click()
    cy.wait('@getReviews')

    // Hace click en la estrella 4
    cy.get('button[type="button"]').eq(3).click()
    cy.get('textarea, input[placeholder*="comentario"], input[placeholder*="Comentario"]')
      .type('Muy buena atención')
    cy.contains('Enviar reseña').click()

    cy.wait('@postReview')
    cy.contains('reseña').should('be.visible')
  })

  // ── Admin: agregar clínica ─────────────────────────────────────────────────

  it('no muestra el botón de agregar clínica para usuarios normales', () => {
    cy.contains('+ Agregar clínica').should('not.exist')
  })

  describe('Usuario admin', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-admin-token',
          user: { id: '99', name: 'Admin', email: 'admin@test.com', role: 'admin' },
        },
      }).as('loginAdmin')

      cy.visit('/login')
      cy.get('input[name="email"]').type('admin@test.com')
      cy.get('input[name="password"]').type('adminpass123')
      cy.get('button[type="submit"]').click()
      cy.wait('@loginAdmin')
      cy.visit('/clinics')
      cy.wait('@getClinics')
    })

    it('muestra el botón + Agregar clínica para admin', () => {
      cy.contains('+ Agregar clínica').should('be.visible')
    })

    it('abre el formulario de nueva clínica', () => {
      cy.contains('+ Agregar clínica').click()
      cy.contains('Nueva clínica').should('be.visible')
    })
  })
})