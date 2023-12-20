type Data<K extends string | number | symbol, V> = {
  [key in K]: V;
};

type GetAll<K extends string | number | symbol, V> = () => Promise<Data<K, V>>;
type GetKeys<K> = () => Promise<K[]>;
type IsValueExistByKey<K> = (key: K, value: unknown) => Promise<boolean>;
type IsKeyExist<K> = (key: K) => Promise<boolean>;
type RemoveKey<K> = (key: K) => Promise<void>;
type GetByKey<K, V> = (key: K) => Promise<V>;
type Upsert<K, V> = (key: K, value: V) => Promise<void>;
type AddToArray<K> = (key: K, value: unknown) => Promise<void>;
type RemoveFromArray<K> = (key: K, value: unknown) => Promise<void>;

export abstract class StoreSource<K extends string | number | symbol, V> {
  getAll: GetAll<K, V>;
  getKeys: GetKeys<K>;
  isValueExistByKey: IsValueExistByKey<K>;
  abstract isKeyExist: IsKeyExist<K>;
  abstract removeKey: RemoveKey<K>;
  abstract getByKey: GetByKey<K, V>;
  abstract upsert: Upsert<K, V>;
  // два метода не универсальные, но вроде лучше чем смешивать в один update
  abstract addToArray: AddToArray<K>;
  abstract removeFromArray: RemoveFromArray<K>;
}
