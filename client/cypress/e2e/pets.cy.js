// cypress/e2e/pets.cy.js
// Pruebas de gestión de mascotas: listar, agregar, editar, eliminar

const mockPets = [
  { id: '1', name: 'Firulais', species: 'perro', breed: 'Labrador', notes: 'Le gusta jugar' },
  { id: '2', name: 'Michi',    species: 'gato',  breed: 'Siamés',   notes: '' },
]

describe('Mascotas', () => {
  beforeEach(() => {
    // Intercepta login
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'user' },
      },
    }).as('login')

    // Intercepta GET de mascotas
    cy.intercept('GET', '**/api/pets*', {
      statusCode: 200,
      body: mockPets,
    }).as('getPets')

    cy.visit('/login')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@login')
    cy.visit('/pets')
    cy.wait('@getPets')
  })

  // ── Listado ────────────────────────────────────────────────────────────────

  it('muestra el título Mis mascotas', () => {
    cy.contains('Mis mascotas').should('be.visible')
  })

  it('muestra las mascotas existentes', () => {
    cy.contains('Firulais').should('be.visible')
    cy.contains('Michi').should('be.visible')
  })

  it('muestra la especie y raza de cada mascota', () => {
    cy.contains('perro').should('be.visible')
    cy.contains('Labrador').should('be.visible')
    cy.contains('gato').should('be.visible')
    cy.contains('Siamés').should('be.visible')
  })

  it('muestra mensaje cuando no hay mascotas', () => {
    cy.intercept('GET', '**/api/pets*', { statusCode: 200, body: [] }).as('getPetsEmpty')
    cy.visit('/pets')
    cy.wait('@getPetsEmpty')
    cy.contains('Aún no tienes mascotas registradas').should('be.visible')
  })

  // ── Formulario: agregar ────────────────────────────────────────────────────

  it('muestra el formulario al hacer click en + Agregar mascota', () => {
    cy.contains('+ Agregar mascota').click()
    cy.contains('Nueva mascota').should('be.visible')
    cy.get('input[placeholder="Firulais"]').should('be.visible')
  })

  it('oculta el formulario al hacer click en Cancelar', () => {
    cy.contains('+ Agregar mascota').click()
    cy.contains('Nueva mascota').should('be.visible')
    cy.contains('Cancelar').click()
    cy.contains('Nueva mascota').should('not.exist')
  })

  it('agrega una nueva mascota correctamente', () => {
    cy.intercept('POST', '**/api/pets*', {
      statusCode: 201,
      body: { id: '3', name: 'Rex', species: 'perro', breed: 'Pastor Alemán', notes: '' },
    }).as('createPet')

    // Vuelve a interceptar GET para la recarga
    cy.intercept('GET', '**/api/pets*', {
      statusCode: 200,
      body: [...mockPets, { id: '3', name: 'Rex', species: 'perro', breed: 'Pastor Alemán', notes: '' }],
    }).as('getPetsUpdated')

    cy.contains('+ Agregar mascota').click()
    cy.get('input[placeholder="Firulais"]').type('Rex')
    cy.get('select').first().select('perro')
    cy.get('input[placeholder="Labrador"]').type('Pastor Alemán')
    cy.contains('Guardar mascota').click()

    cy.wait('@createPet')
    cy.wait('@getPetsUpdated')
    cy.contains('Rex').should('be.visible')
  })

  it('no permite guardar mascota sin nombre', () => {
    cy.contains('+ Agregar mascota').click()
    cy.contains('Guardar mascota').click()
    // El campo nombre es required (HTML5)
    cy.get('input[placeholder="Firulais"]:invalid').should('exist')
  })

  // ── Editar ─────────────────────────────────────────────────────────────────

  it('abre el formulario de edición al hacer click en Editar', () => {
    cy.contains('Firulais').parents('.bg-white').first().contains('Editar').click()
    cy.contains('Editando: Firulais').should('be.visible')
    cy.get('input[placeholder="Firulais"]').should('have.value', 'Firulais')
  })

  it('actualiza una mascota correctamente', () => {
    cy.intercept('PUT', '**/api/pets/1*', {
      statusCode: 200,
      body: { id: '1', name: 'Firulais', species: 'perro', breed: 'Golden Retriever', notes: '' },
    }).as('updatePet')

    cy.intercept('GET', '**/api/pets*', {
      statusCode: 200,
      body: [
        { id: '1', name: 'Firulais', species: 'perro', breed: 'Golden Retriever', notes: '' },
        mockPets[1],
      ],
    }).as('getPetsUpdated')

    cy.contains('Firulais').parents('.bg-white').first().contains('Editar').click()
    cy.get('input[placeholder="Labrador"]').clear().type('Golden Retriever')
    cy.contains('Actualizar mascota').click()

    cy.wait('@updatePet')
    cy.wait('@getPetsUpdated')
    cy.contains('Golden Retriever').should('be.visible')
  })

  // ── Eliminar ───────────────────────────────────────────────────────────────

  it('elimina una mascota tras confirmar el diálogo', () => {
    cy.intercept('DELETE', '**/api/pets/2*', { statusCode: 200, body: {} }).as('deletePet')
    cy.intercept('GET', '**/api/pets*', {
      statusCode: 200,
      body: [mockPets[0]],
    }).as('getPetsAfterDelete')

    // Acepta el confirm() del navegador
    cy.on('window:confirm', () => true)

    cy.contains('Michi').parents('.bg-white').first().contains('Eliminar').click()
    cy.wait('@deletePet')
    cy.contains('Michi').should('not.exist')
  })

  it('no elimina la mascota si el usuario cancela el diálogo', () => {
    cy.on('window:confirm', () => false)

    cy.contains('Michi').parents('.bg-white').first().contains('Eliminar').click()
    cy.contains('Michi').should('be.visible')
  })
})