import request from "supertest";
import * as chai from "chai";
import app from '../src/server.js';
import path from "path";

const {expect} = chai;
describe('Pruebas /api/students', () => {
  let token;
  let studentId;
  it('Debe registrar un usuario', async () => {
    const imagePath = path.resolve("./test/images/epn.png");
    const res = await request(app)
      .post("/api/students/register")
      .field("username", "testuser")
      .field("password", "qwerty")
      .attach("imagen", imagePath)      

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("id", "username", "password", "imagen");
    expect(res.body).to.have.property("imagen").that.is.a("string");    
    studentId = res.body.id;
     // Guardar el ID para pruebas posteriores
  });
  it("Debe devolver un token al iniciar sesion", async () => {
        const loginData = {
      username: "testuser",
      password: "qwerty",
    };

    const res = await request(app)
      .post("/api/students/login")
      .send(loginData);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("token");

    token = res.body.token;
  });
  it("Debe actualizar un estudiante (PUT /api/students/:id)", async () => {
    const imagePath = path.resolve("./test/images/profile.jpg");
    const res = await request(app)
      .put(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("username", "test")
      .field("password", "123456")
      .attach("imagen", imagePath)   

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.include.keys("id", "username", "password");
    expect(res.body.username).to.equal("test");
  });

  it("Debe eliminar un estudiante (DELETE /api/students/:id)", async () => {
    const res = await request(app).delete(`/api/students/${studentId}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body.success).to.equal(true);

    // Verificar que el estudiante ya no existe
    const verifyRes = await request(app).delete(`/api/students/${studentId}`).set("Authorization", `Bearer ${token}`);
    expect(verifyRes.statusCode).to.equal(404);
  });
});
