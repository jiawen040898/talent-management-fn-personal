import { secretService } from '@pulsifi/fn';
import { DataSource } from 'typeorm';

import { ENTITIES } from './models';

type DbSecret = {
    username: string;
    engine: string;
    port: number;
    host: string;
    password: string;
    schema: string;
    dbname: string;
    dbInstanceIdentifier: string;
};

let dataSource: DataSource;

export const getDataSource = async (): Promise<DataSource> => {
    if (dataSource?.isInitialized) {
        return dataSource;
    }

    const dbSecret = await secretService.getSecret<DbSecret>(
        process.env.SM_NAME as string,
    );

    dataSource = await new DataSource({
        type: 'postgres',
        host: dbSecret.host,
        port: dbSecret.port,
        username: dbSecret.username,
        password: dbSecret.password,
        database: dbSecret.dbname,
        schema: dbSecret.schema,
        entities: [...ENTITIES],
        maxQueryExecutionTime: 1000,
        synchronize: false,
        migrationsRun: false,
        migrations: [],
        extra: {
            connectionTimeoutMillis: 3000,
            idleTimeoutMillis: 1000,
            max: 1,
        },
        logging: ['error'],
    }).initialize();

    return dataSource;
};
