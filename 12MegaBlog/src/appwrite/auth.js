import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}) {
        try {
            // Clean up any lingering active session before creating and logging in
            try {
                await this.account.deleteSession('current');
            } catch (sessionErr) {
                // Ignore if no active session
            }

            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return await this.login({email, password});
            } else {
                return userAccount;
            }
        } catch (error) {
            console.error("Appwrite auth :: createAccount :: error", error);
            throw error;
        }
    }

    async login({email, password}) {
        try {
            // Clean up any lingering active session to prevent session collision
            try {
                await this.account.deleteSession('current');
            } catch (sessionErr) {
                // Ignore if no active session
            }
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error("Appwrite auth :: login :: error", error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            // Unauthenticated or expired session
            return null;
        }
    }

    async updatePassword({ newPassword, oldPassword }) {
        try {
            return await this.account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error("Appwrite service :: updatePassword :: error", error);
            throw error;
        }
    }

    async updateName({ name }) {
        try {
            return await this.account.updateName(name);
        } catch (error) {
            console.error("Appwrite service :: updateName :: error", error);
            throw error;
        }
    }

    async updateEmail({ email, password }) {
        try {
            return await this.account.updateEmail(email, password);
        } catch (error) {
            console.error("Appwrite service :: updateEmail :: error", error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.error("Appwrite service :: logout :: error", error);
        }
    }
}

const authService = new AuthService();
export default authService;
