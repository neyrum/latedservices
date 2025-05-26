require("dotenv").config();
const ldap = require("ldapjs");

const createLdapClient = () => {
    return ldap.createClient({ url: process.env.LDAP_URL });
};

// 🔹 Autenticar usuario en LDAP
async function authenticate(username, password) {
    return new Promise((resolve, reject) => {
        const client = createLdapClient();
        const userDN = process.env.LDAP_USER_DN_TEMPLATE.replace("%s", username);

        client.bind(userDN, password, (err) => {
            if (err) {
                console.error(`❌ Error de autenticación LDAP para ${username}:`, err);
                reject({ message: "Autenticación fallida", error: err });
            } else {
                console.log("✅ Usuario autenticado:", username);
                resolve({ message: "Autenticación exitosa" });
            }
            client.unbind(); // **Cerrar conexión después de cada autenticación**
        });
    });
}

async function getUserDetails(username) {
    return new Promise((resolve, reject) => {
        const client = createLdapClient();
        const baseDN = "dc=unah,dc=edu,dc=cu"; // Ajusta si necesitas otra base

        const searchOptions = {
            filter: `(|(cn=${username})(sAMAccountName=${username})(uid=${username}))`,
            scope: "sub",
            attributes: ["givenName", "sn", "mail", "uid", "sAMAccountName", "displayName"],
        };

        console.log("🔍 Realizando búsqueda LDAP para:", username);

        client.search(baseDN, searchOptions, (err, res) => {  
            if (err) {
                console.error("❌ Error en búsqueda LDAP:", err);
                return reject("Error al buscar usuario en LDAP");
            }

            let userDetails = null;
            
            res.on("searchEntry", (entry) => {
                console.log("✅ Datos del usuario encontrados:", entry.object);
                userDetails = entry.object;
            });

            res.on("error", (searchErr) => {
                console.error("❌ Error en búsqueda LDAP:", searchErr);
                reject("Error en búsqueda LDAP");
            });

            res.on("end", () => {
                if (userDetails) {
                    resolve(userDetails);
                } else {
                    reject("Usuario no encontrado en Active Directory");
                }
                client.unbind(); // 🔹 **Cerrar conexión aquí, después de procesar los resultados**
            });
        });
    });
}

module.exports = { authenticate, getUserDetails };
