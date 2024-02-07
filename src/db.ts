import mariadb from 'mariadb'

// singleton pool
let pool: any = null

export function getPool() {
  if (!pool) {
    const cfg: any = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      database: process.env.DB_DATABASE,
      connectionLimit: 3,
      maxIdle: 3,
      enableKeepAlive: true,
      insecureAuth: true
    }

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
      cfg.password = process.env.DB_PASSWORD
    }

    if (process.env.NODE_ENV === 'production') {
      cfg.insecureAuth = false
      cfg.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false // self-signed certificate
      }
    }

    pool = mariadb.createPool(cfg)
  }

  return pool
}
