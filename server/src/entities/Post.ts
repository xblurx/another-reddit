import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: 'int', default: 0 })
    points!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User, (user) => user.posts)
    creator: User;

    @OneToMany(() => Upvote, (upvote) => upvote.post)
    upvotes: Upvote[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @CreateDateColumn()
    updatedAt: Date;
}
