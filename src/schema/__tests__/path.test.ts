import { Path } from "../path";

describe("Path Class", () => {
    describe("Constructor & Format Validation", () => {
        test("should create an absolute path", () => {
            const path = new Path("/home/user", { format: "absolute" });
            expect(path.getType()).toBe("absolute");
            expect(path.getPath()).toBe("/home/user");
        });

        test("should create a relative path", () => {
            const path = new Path("documents/file.txt", { format: "relative" });
            expect(path.getType()).toBe("relative");
            expect(path.getPath()).toBe("documents/file.txt");
        });

        test("should throw error for incorrect absolute path", () => {
            expect(() => new Path("relative/path", { format: "absolute" }))
                .toThrow("Invalid absolute path: relative/path");
        });

        test("should throw error for incorrect relative path", () => {
            expect(() => new Path("/absolute/path", { format: "relative" }))
                .toThrow("Invalid relative path: /absolute/path");
        });

        test("should enforce maxLen constraint", () => {
            expect(() => new Path("/a".repeat(300), { maxLen: 255 }))
                .toThrow("Path exceeds maximum length");
        });
    });

    describe("Path Cleaning", () => {
        test("should clean '../' and './'", () => {
            const path = new Path("/home/user/../documents/./file.txt", {});
            expect(path.getPath()).toBe("/home/documents/file.txt");
        });

        test("should clean redundant slashes", () => {
            const path = new Path("//home//user///documents//", {});
            expect(path.getPath()).toBe("/home/user/documents");
        });
    });

    describe("Variable Resolution", () => {
        test("should resolve variables in path", () => {
            const variables = { HOME: "/home/user", PROJECT: "my_project" };
            const path = new Path("${HOME}/documents/${PROJECT}", {});
            const resolved = path.resolve(variables);
            expect(resolved.getPath()).toBe("/home/user/documents/my_project");
        });

        test("should keep unresolved variables", () => {
            const variables = { HOME: "/home/user" };
            const path = new Path("${HOME}/docs/${PROJECT}", {});
            const resolved = path.resolve(variables);
            expect(resolved.getPath()).toBe("/home/user/docs/${PROJECT}");
        });

        test("should throw error for unbalanced brackets", () => {
            expect(() => new Path("/path/${variable}/end}", {}))
                .toThrow("Unbalanced brackets: /path/${variable}/end}");
        });

        test("should throw error for unbalanced brackets in resolve", () => {
            expect(() => new Path("/path/${variable}/${end", {}).resolve({}))
                .toThrow("Unbalanced brackets: /path/${variable}/${end");
        });
    });

    describe("Path Navigation", () => {
        test("should navigate up directories", () => {
            const path = new Path("/home/user/documents", {});
            expect(path.up().getPath()).toBe("/home/user");
        });

        test("should navigate down directories", () => {
            const path = new Path("/home/user", {});
            expect(path.down("documents").getPath()).toBe("/home/user/documents");
        });
    });

    describe("Path Matching", () => {
        test("should match exact paths", () => {
            const path = new Path("/home/user/docs", {});
            expect(path.match("/home/user/docs")).toBe(true);
            expect(path.match("/home/user/other")).toBe(false);
        });

        test("should match single wildcard `*`(this based)", () => {
            const path = new Path("/home/*/docs", {});
            expect(path.match("/home/user/docs", "this")).toBe(true);
            expect(path.match("/home/admin/docs", "this")).toBe(true);
            expect(path.match("/home/admin/temp/docs", "this")).toBe(false);
        });

        test("should match double wildcard `**`(this based)", () => {
            const path = new Path("/home/**/docs", {});
            expect(path.match("/home/user/docs", "this")).toBe(true);
            expect(path.match("/home/admin/temp/docs", "this")).toBe(true);
            expect(path.match("/home/docs", "this")).toBe(true);
            expect(path.match("/home/admin/temp/other/docs", "this")).toBe(true);
        });

        test("should match single wildcard `*`(outer based)", () => {
            const path = new Path("/home/user/docs", {});
            expect(path.match("/home/*/docs", "outer")).toBe(true);
            expect(path.match("/*/user/docs", "outer")).toBe(true);
            expect(path.match("*/user/temp/docs", "outer")).toBe(false);
            expect(path.match("/home/user/*", "outer")).toBe(true);
        });

        test("should match double wildcard `**`(outer based)", () => {
            const path = new Path("/home/user/docs", {});
            expect(path.match("/home/**/docs", "outer")).toBe(true);
            expect(path.match("/**/admin/docs", "outer")).toBe(false);
            expect(path.match("/**/admin/temp/docs", "outer")).toBe(false);
            expect(path.match("/home/**", "outer")).toBe(true);
            expect(path.match("/**/do*", "outer")).toBe(true);
        });

        test("word after double wildcard `**` appears twice", () => {
            const path = new Path("/home/**/docs", {});
            expect(path.match("/home/user/docs/test/docs", "this")).toBe(true);
        });

        test("should match mixed wildcard patterns", () => {
            const path = new Path("/static/**/*.css", {});
            expect(path.match("/static/style.css", "this")).toBe(true);
            expect(path.match("/static/sub/style.css", "this")).toBe(true);
            expect(path.match("/static/sub/other/style.css", "this")).toBe(true);
            expect(path.match("/static/style.js", "this")).toBe(false);
        });

        test("should match multiple double wildcards `**`", () => {
            const path = new Path("/home/**/user/**/docs", {});
            expect(path.match("/home/user/docs", "this")).toBe(true);
            expect(path.match("/home/admin/test/user/docs", "this")).toBe(true);
            expect(path.match("/home/admin/test/user/test/temp/docs", "this")).toBe(true);
            expect(path.match("/home/admin/user/temp/other/docs", "this")).toBe(true);
            expect(path.match("/home/admin/temp/other/file/docs", "this")).toBe(false);
        });

        test("continuous double wildcards `**`", () => {
            const path = new Path("/home/**/**/docs", {});
            expect(path.match("/home/user/docs", "this")).toBe(true);
            expect(path.match("/home/docs/docs/user/docs", "this")).toBe(true);
        });
    });
});
