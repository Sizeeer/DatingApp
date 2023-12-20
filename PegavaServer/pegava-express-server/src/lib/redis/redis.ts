import type { RedisClientType } from "redis";
import { createClient } from "redis";

const url = "redis://127.0.0.1:6379";

export class RedisSingleton {
  private static _instance: RedisSingleton;
  public client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url,
    });
    this.client.on("error", (err) => {
      console.error(
        "Error occured while connecting or accessing redis server: ",
        err
      );
    });

    void this.client.connect();
  }

  public static getInstance(): RedisSingleton {
    if (!RedisSingleton._instance) {
      RedisSingleton._instance = new RedisSingleton();
    }
    return RedisSingleton._instance;
  }
}
