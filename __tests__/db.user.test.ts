import UserDatabase, { User } from "../src/bd/user";
import Database from "better-sqlite3";

describe("UserDatabase", () => {
  let db: Database.Database;
  let userDb: UserDatabase;

  beforeAll(() => {
    // Crear una base de datos en memoria para las pruebas
    db = new Database(":memory:");
    userDb = new UserDatabase(db);
  });

  afterAll(() => {
    db.close(); // Cerrar la base de datos después de las pruebas
  });

  beforeEach(() => {
    // Inicializar la tabla antes de cada prueba
    userDb = new UserDatabase(db);
  });

  it("should throw an error for invalid timezone format in saveUser", () => {
    const user: User = {
      chatId: 1,
      language: "en",
      timezone: "UTC", // No es válido
    };

    expect(() => userDb.saveUser(user)).toThrow(
      "Invalid timezone format. It must be GMT+N or GMT-N."
    );
  });

  it("should throw an error for invalid timezone format in updateTimezone", () => {
    const user: User = {
      chatId: 2,
      language: "en",
      timezone: "GMT+2",
    };

    userDb.saveUser(user); // Guardamos el usuario primero

    expect(() => userDb.updateTimezone(2, "Europe/London")).toThrow(
      "Invalid timezone format. It must be GMT+N or GMT-N."
    );
  });

  it("should save and update user with valid timezone format", () => {
    const user: User = {
      chatId: 3,
      language: "en",
      timezone: "GMT+5",
    };

    userDb.saveUser(user); // Guardamos el usuario

    const updatedUser: User = {
      chatId: 3,
      language: "en",
      timezone: "GMT-3",
    };

    userDb.updateTimezone(3, updatedUser.timezone);

    const fetchedUser = userDb.getUser(3);
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.timezone).toBe("GMT-3");
  });
});
