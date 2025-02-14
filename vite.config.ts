import tailwindcss from '@tailwindcss/vite';
import { resolve } from "path";
import { defineConfig } from "vite";


export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                404: resolve(__dirname, "404.html"),
            }
        }
    }
});
