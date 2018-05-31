declare module "package.json" {
    const value: {
        title: string;
        version: string;
        author: string;
        homepage: string;
        bugs_url: string;
        build_time: string;
    };
    export = value;
}