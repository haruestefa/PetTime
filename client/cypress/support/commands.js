// Comando personalizado: cy.login(email, password)
// Hace login vía la UI de la aplicación
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

// Comando personalizado: cy.loginByApi(email, password)
// Hace login directamente por API e inyecta el token en localStorage
// Útil para preparar el estado antes de pruebas que no testean el login
Cypress.Commands.add('loginByApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:3001'}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      window.localStorage.setItem('token', response.body.token)
    }
  })
})