import { RedisSingleton } from "./redis";
import { StoreSource } from "./storeSource";

const ONE_TIME_CODES_KEY = "one-time-codes";

type K = string;
type V = number;

//@ts-ignore TODO:
export class OneTimeCodeRedisSource extends StoreSource<K, V> {
  private static _instance: OneTimeCodeRedisSource;
  private redisInstance: RedisSingleton;

  private constructor() {
    super();
    this.redisInstance = RedisSingleton.getInstance();
  }

  public static getInstance(): OneTimeCodeRedisSource {
    if (!OneTimeCodeRedisSource._instance) {
      OneTimeCodeRedisSource._instance = new OneTimeCodeRedisSource();
    }
    return OneTimeCodeRedisSource._instance;
  }

  //@ts-ignore TODO:
  getAll = async () => this.redisInstance.client.hGetAll(ONE_TIME_CODES_KEY);

  isKeyExist = async (key: K) =>
    this.redisInstance.client.hExists(ONE_TIME_CODES_KEY, String(key));

  removeKey = async (key: K) => {
    await this.redisInstance.client.hDel(ONE_TIME_CODES_KEY, String(key));
  };

  //@ts-ignore TODO:
  getByKey = async (key: K) =>
    this.redisInstance.client.hGet(ONE_TIME_CODES_KEY, String(key));

  upsert = async (key: K, value: V) => {
    await this.redisInstance.client.hSet(
      ONE_TIME_CODES_KEY,
      String(key),
      value
    );
  };
}
