import request from "supertest";
import * as chai from "chai";
import app from '../src/server.js';
import path from "path";

const {expect} = chai;
describe('Pruebas /api/communities', () => {
  let communityId;
  let token;
  before(async () => {
    // Inicia sesión para obtener el token
    const loginData = {
      username: "joseph",
      password: "qwerty",
    };

    const res = await request(app)
      .post("/api/students/login")
      .send(loginData);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("token");

    token = res.body.token; // Guardar el token para usarlo en las siguientes pruebas
  });
  it('Debe devolver una lista de comunidades', async () => {
    const res = await request(app).get('/api/communities');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array');
  });
  it("Debe crear una nueva comunidad (POST /api/communities)", async () => {
    const imagePath = path.resolve("./test/images/epn.png");
    const res = await request(app)
      .post("/api/communities")
      .set("Authorization", `Bearer ${token}`)
      .field("nombre", "Comunidad de Prueba")
      .field("descripcion", "Esta es una comunidad de prueba")
      .attach("imagen", imagePath)      

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.include.keys("id", "nombre", "descripcion", "imagen");
    expect(res.body).to.have.property("imagen").that.is.a("string");    
    communityId = res.body.id; // Guardar el ID para pruebas posteriores
  });
  it("Debe obtener una comunidad por ID (GET /api/communities/:id)", async () => {
    const res = await request(app).get(`/api/communities/${communityId}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.include.keys("id", "nombre", "descripcion");
    expect(res.body.id).to.equal(communityId);
  });

  it("Debe actualizar una comunidad (PUT /api/communities/:id)", async () => {
    const updatedData = {
      nombre: "Comunidad Actualizada",
      descripcion: "Descripción actualizada",
    };

    const res = await request(app)
      .put(`/api/communities/${communityId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("id", "nombre", "descripcion");
    expect(res.body.nombre).to.equal(updatedData.nombre);
  });

  it("Debe eliminar una comunidad (DELETE /api/communities/:id)", async () => {
    const res = await request(app).delete(`/api/communities/${communityId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("msg");

    // Verificar que la comunidad ya no existe
    const verifyRes = await request(app).get(`/api/communities/${communityId}`);
    expect(verifyRes.statusCode).to.equal(404);
  });
});
