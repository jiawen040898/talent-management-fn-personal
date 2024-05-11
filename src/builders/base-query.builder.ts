import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

export abstract class BaseQueryBuilder<T extends ObjectLiteral> {
    protected readonly builder: SelectQueryBuilder<T>;
    protected includeDeletedJob = false;

    constructor(
        private readonly repository: Repository<T>,
        protected readonly alias: string,
    ) {
        this.builder = this.repository.createQueryBuilder(alias);
    }

    build(): SelectQueryBuilder<T> {
        if (!this.includeDeletedJob) {
            this.builder.andWhere(`${this.alias}.is_deleted = false`);
        }

        return this.builder;
    }
}
