"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const appwrite_1 = require("appwrite");
const client = new appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '');
exports.storage = new appwrite_1.Storage(client);
