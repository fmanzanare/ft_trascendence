import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
    server: {
        https: {
            key: fs.readFileSync(path.resolve('https/key.pem')),
            cert: fs.readFileSync(path.resolve('https/cert.pem'))
        }
    }
})