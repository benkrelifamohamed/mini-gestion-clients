// 1. Lit le fichier .env
require("dotenv").config();
const { Client } = require("pg");
// 2. Connexion (SANS mot de passe en dur !)
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// 3. Lister tous les clients
async function listerClients() {
  const res = await client.query("SELECT * FROM clients ORDER BY id");
  console.log("\n--- Liste des clients ---");
  for (const c of res.rows) {
    console.log(`#${c.id} ${c.nom} | ${c.tel} | ${c.wilaya}`);
  }
  console.log(`Total : ${res.rows.length} client(s)`);
}

// 4. Ajouter un client ($1, $2, $3 = anti-injection SQL)
async function ajouterClient(nom, tel, wilaya) {
  await client.query(
    "INSERT INTO clients (nom, tel, wilaya) VALUES ($1, $2, $3)",
    [nom, tel, wilaya],
  );
  console.log(`\n+ Client ajouté : ${nom} (${wilaya})`);
}

async function rechercherParWilaya(wilaya) {
  const res = await client.query("SELECT * FROM clients WHERE wilaya = $1", [
    wilaya,
  ]);
  console.log(`\n--- Clients (${wilaya}) ---`);
  if (res.rows.length === 0) {
    console.log("(aucun)");
    return;
  }
  for (const c of res.rows) {
    console.log(`#${c.id} ${c.nom} | ${c.tel}`);
  }
}

// 5. Programme principal
async function main() {
  try {
    await client.connect();
    console.log("Connecté à PostgreSQL ✓");
    await listerClients();
    await ajouterClient("Pharmacie El Nour", "0555 44 33 22", "Blida");
    await listerClients();
    await rechercherParWilaya("Oran");
  } catch (err) {
    console.error("ERREUR :", err.message);
  } finally {
    await client.end();
    console.log("\nConnexion fermée. Au revoir !");
  }
}

main();
