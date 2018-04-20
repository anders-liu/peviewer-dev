declare module "package.json" {
    const value: {
        title: string;
        version: string;
        author: string;
        homepage: string;
        bugs: {
            url: string;
        }
    };
    export = value;
}