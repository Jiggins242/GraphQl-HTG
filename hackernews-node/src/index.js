const { GraphQLServer } = require ('graphql-yoga');



// ---- dummy data ----
let links = [{
    id: 'link-0',
    url: 'www.bbc.com',
    description: 'Link to bbc'
}];
// ---- dummy data ----

let idCount = links.length;

const resolvers = {
    Query: {
        info: () => 'This is the API call',
        feed: () => links
    },

    Mutation: {
        post: (parent, args) => {
            const link = {
                id: `link-${idCount++}`,
                description: args.description,
                url: args.url 
            }
            links.push(link)
            return link
        }
    }
};

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
});

server.start(() => console.log('--- Server is running on localhost: 4000 --- '));