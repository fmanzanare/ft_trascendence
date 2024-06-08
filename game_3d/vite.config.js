import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
    server: {
        https: {
            key: fs.readFileSync(path.resolve('/usr/src/django/https/front/key.pem')),
            cert: fs.readFileSync(path.resolve('/usr/src/django/https/front/cert.pem'))
        }
    }
})