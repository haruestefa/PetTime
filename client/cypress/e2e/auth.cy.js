// cypress/e2e/auth.cy.js
// Pruebas de autenticación: login, registro, rutas protegidas, logout

describe('Autenticación', () => {
  beforeEach(() => {
    // Limpia localStorage antes de cada prueba
    cy.clearLocalStorage()
  })

  // ── Página de login ────────────────────────────────────────────────────────

  describe('Página de Login', () => {
    it('muestra el formulario de login', () => {
      cy.visit('/login')
      cy.contains('Iniciar sesión').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Iniciar sesión')
    })

    it('muestra enlace para ir a registro', () => {
      cy.visit('/login')
      cy.contains('Regístrate').should('have.attr', 'href', '/register')
    })

    it('no permite enviar el formulario vacío', () => {
      cy.visit('/login')
      cy.get('button[type="submit"]').click()
      // El campo email es requerido (HTML5 validation)
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('muestra error con credenciales incorrectas', () => {
      // Intercepta la llamada a la API para simular error 401
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { message: 'Credenciales inválidas' },
      }).as('loginFail')

      cy.visit('/login')
      cy.get('input[name="email"]').type('noexiste@test.com')
      cy.get('input[name="password"]').type('contrasenaMal')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginFail')
      cy.contains('Credenciales inválidas').should('be.visible')
    })

    it('redirige al dashboard tras login exitoso', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'user' },
        },
      }).as('loginOk')

      cy.visit('/login')
      cy.get('input[name="email"]').type('test@test.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@loginOk')
      cy.url().should('include', '/dashboard')
    })
  })

  // ── Página de registro ─────────────────────────────────────────────────────

  describe('Página de Registro', () => {
    it('muestra el formulario de registro', () => {
      cy.visit('/register')
      cy.contains('Crear cuenta').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('contain', 'Registrarse')
    })

    it('muestra enlace para ir a login', () => {
      cy.visit('/register')
      cy.contains('Iniciar sesión').should('have.attr', 'href', '/login')
    })

    it('muestra error si la contraseña tiene menos de 6 caracteres', () => {
      cy.visit('/register')
      cy.get('input[name="name"]').type('Juan')
      cy.get('input[name="email"]').type('juan@test.com')
      cy.get('input[name="password"]').type('12345')
      cy.get('button[type="submit"]').click()
      cy.contains('al menos 6 caracteres').should('be.visible')
    })

    it('redirige al dashboard tras registro exitoso', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          token: 'fake-jwt-token',
          user: { id: '2', name: 'Juan', email: 'juan@test.com', role: 'user' },
        },
      }).as('registerOk')

      cy.visit('/register')
      cy.get('input[name="name"]').type('Juan Pérez')
      cy.get('input[name="email"]').type('juan@test.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      cy.wait('@registerOk')
      cy.url().should('include', '/dashboard')
    })
  })

  // ── Rutas protegidas ───────────────────────────────────────────────────────

  describe('Protección de rutas', () => {
    it('redirige /dashboard a /login si no está autenticado', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('redirige /pets a /login si no está autenticado', () => {
      cy.visit('/pets')
      cy.url().should('include', '/login')
    })

    it('redirige /appointments a /login si no está autenticado', () => {
      cy.visit('/appointments')
      cy.url().should('include', '/login')
    })

    it('redirige /clinics a /login si no está autenticado', () => {
      cy.visit('/clinics')
      cy.url().should('include', '/login')
    })
  })
})