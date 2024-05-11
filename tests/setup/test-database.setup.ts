import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { ENTITIES } from '../../src/models';

export type EntityTestData = {
    entityClass: EntityTarget<ObjectLiteral>;
    data: SafeAny;
};

let dataSource: DataSource;

export const getTestDataSource = async () => {
    if (!dataSource) {
        dataSource = await new DataSource({
            type: 'better-sqlite3',
            database: ':memory:',
            dropSchema: true,
            entities: ENTITIES,
            synchronize: true,
            logging: true,
            name: 'test',
        }).initialize();
    }

    return dataSource;
};

export const getTestDataSourceAndAddData = async (
    testDataToBeAddedToDb: EntityTestData[],
) => {
    const dataSource = await getTestDataSource();
    for (const entityTestData of testDataToBeAddedToDb) {
        const repo = dataSource.getRepository(entityTestData.entityClass);
        await repo.save(entityTestData.data);
    }

    return dataSource;
};
