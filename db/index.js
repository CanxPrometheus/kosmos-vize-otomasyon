const mysql = require("mysql");
let con;
function handleDisconnect() {
    con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "kosmos_vize_otomasyon_new"
    });

    con.connect(err => {
        if (err) {
            console.error("Error connecting to the database:", err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log("Connected to the database!");
        }
    });

    con.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error("Database connection was closed. Reconnecting...");
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();
setInterval(() => {
    con.query('SELECT 1', (err, results, fields) => {
        if (err) {
            console.error('Error keeping the connection alive:', err);
            handleDisconnect();
        } else {
            console.log('Connection is alive');
        }
    });
}, 300000);




module.exports.ExecuteSql = async function(sql, params) {
    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}