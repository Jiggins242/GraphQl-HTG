const { GraphQLServer } = require ('graphql-yoga');
const { Prisma } = require ('prisma-binding');

const resolvers = {
    Query: {
        info: () => 'This is the API call',
        feed: (parent, args, context, info) => {
            return context.db.query.links({}, info)
        }
    },

    Mutation: {
        post: (parent, args, context, info) => {
            return context.db.mutation.createLink({
                data: {
                    url: args.url,
                    description: args.description,
                },
            }, info)
        }
    }
};

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        db: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: 'https://eu1.prisma.sh/jim/database/dev',
            secret: 'mysecret123',
            debug: true
        })
    })
});

server.start(() => console.log('--- Server is running on localhost: 4000 --- '));