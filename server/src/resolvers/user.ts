import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2'
import { EntityManager } from "@mikro-orm/postgresql"; 
@InputType()
class UsernameAndPassword{
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError{
    @Field()
    field:string
    @Field()
    message: string
}

@ObjectType()
class UserResponse{
    @Field(()=>[FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(()=>User, {nullable:true})
    user?:User
}

@Resolver()
export class UserResolver {
    @Mutation(()=>UserResponse)
    async register(
        @Arg("options") options: UsernameAndPassword,
        @Ctx() {em}: MyContext
    ):Promise<UserResponse>{
        if(options.username.length<=2){
            return {
                errors:[{
                    field:'username',
                    message:'username is too short'
                }]
            }
        }
        if(options.password.length<=3){
            return {
                errors:[{
                    field:'password',
                    message:'password is too short'
                }]
            }
        }
        let user;
        const hashedPass = await argon2.hash(options.password)
        try {
            const result = await (em as EntityManager)
                .createQueryBuilder(User)
                .getKnexQuery()
                .insert({
                    username:options.username,
                    password:hashedPass,
                    created_at: new Date(),  
                    updated_at: new Date(),  
                })
                .returning("*")
            user =result[0]; 
        } catch (err) {
            if(err.code === '23505')
            return {
                errors:[{
                    field:"username",
                    message:"username is already taken"
                }]
            }
        }
        return {
            user
        }
    }

    @Mutation(()=>UserResponse)
    async login(
        @Arg("options") options: UsernameAndPassword,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {username:options.username});
        if(!user){
            return {
                errors:[{
                    field:"username",
                    message:"no such user"
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid){
            return {
                errors:[{
                    field:"password",
                    message:"incorrect password"
                }]
            }
        }

        // req.session.userId = user.id;
        console.log('REQUEST', req.session)

        return {
            user
        }
    }
}