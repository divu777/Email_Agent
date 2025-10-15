import { RedisClient } from "bun";
import config from "../config";

export class RedisManager {
  private redisClient: RedisClient;
  private static instance: RedisManager;

  constructor() {
    this.redisClient = new RedisClient(config.REDIS_CLIENT);
  }

  async connectClient() {
    if (!this.redisClient.connected) {
      await this.redisClient.connect();
    }
    return;
  }

   static async getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
      await RedisManager.instance.connectClient()
    }
    return RedisManager.instance;
  }

  async setItems(data: any, email: string) {
    try {
      const response = await this.redisClient.set(
        `user:${email}:tokens`,
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.log("Error in setting the items: " + error);
      return false;
    }
  }

  async getItems(email: string) {
    const response = await this.redisClient.get(`user:${email}:tokens`);
    return JSON.parse(response as string);
  }
}
