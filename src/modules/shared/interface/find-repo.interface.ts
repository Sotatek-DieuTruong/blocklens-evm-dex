import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

export interface IFindRepo {
  findOneBy(tableName: string, where: FindOptionsWhere<any> | FindOptionsWhere<any>[]): Promise<any | null>;

  findBy(tableName: string, where: FindOptionsWhere<any> | FindOptionsWhere<any>[]): Promise<any[]>;

  find(tableName: string, options?: FindManyOptions<any>): Promise<any[]>;

  findOne(tableName: string, options: FindOneOptions<any>): Promise<any | null>;
}
