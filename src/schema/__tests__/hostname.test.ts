import { Hostname } from "../hostname";

describe("Hostname Class", () => {
    describe("Constructor & Format Validation", () => {
        test("should create a valid FQDN", () => {
            const hostname = new Hostname("example.com", { format: "fqdn" });
            expect(hostname.getType()).toBe("fqdn");
            expect(hostname.getHostname()).toBe("example.com");
        });

        test("should create a valid shortname", () => {
            const hostname = new Hostname("localhost", { format: "shortname" });
            expect(hostname.getType()).toBe("shortname");
            expect(hostname.getHostname()).toBe("localhost");
        });

        test("should create a valid IPv4 address", () => {
            const hostname = new Hostname("192.168.1.1", { format: "ipv4" });
            expect(hostname.getType()).toBe("ipv4");
            expect(hostname.getHostname()).toBe("192.168.1.1");
        });

        test("should create a valid IPv6 address", () => {
            const hostname = new Hostname("2001:db8::ff00:42:8329", { format: "ipv6" });
            expect(hostname.getType()).toBe("ipv6");
            expect(hostname.getHostname()).toBe("2001:db8::ff00:42:8329");
        });

        test("should create a custom hostname", () => {
            const hostname = new Hostname("custom.hostname", { format: "custom" });
            expect(hostname.getType()).toBe("custom");
            expect(hostname.getHostname()).toBe("custom.hostname");
        });

        test("should throw error for incorrect IPv4 format", () => {
            expect(() => new Hostname("256.256.256.256", { format: "ipv4" }))
                .toThrow("Invalid IPv4 address: 256.256.256.256");
            expect(() => new Hostname("192.168.1", { format: "ipv4" }))
                .toThrow("Invalid IPv4 address: 192.168.1");
            expect(() => new Hostname("192.0.0.", { format: "ipv4" }))
                .toThrow("Invalid IPv4 address: 192.0.0.");
        });

        test("should throw error for incorrect IPv6 format", () => {
            expect(() => new Hostname("2001::zzzz", { format: "ipv6" }))
                .toThrow("Invalid IPv6 address: 2001::zzzz");
        });

        test("should throw error for incorrect FQDN format", () => {
            expect(() => new Hostname("invalid_domain", { format: "fqdn" }))
                .toThrow("Invalid FQDN: invalid_domain");
        });

        test("should throw error for incorrect shortname format", () => {
            expect(() => new Hostname("short name", { format: "shortname" }))
                .toThrow("Invalid shortname: short name");
        });
    });

    describe("Wildcard Matching", () => {
        test("should match single wildcard `*` (this based)", () => {
            const hostname = new Hostname("*.example.com", { format: "fqdn" });
            expect(hostname.match("sub.example.com", "this")).toBe(true);
            expect(hostname.match("another.example.com", "this")).toBe(true);
            expect(hostname.match("example.com", "this")).toBe(false);
        });

        test("should match double wildcard `**` (this based)", () => {
            const hostname = new Hostname("**.example.com", { format: "fqdn" });
            expect(hostname.match("sub.example.com", "this")).toBe(true);
            expect(hostname.match("deep.sub.example.com", "this")).toBe(true);
            expect(hostname.match("example.com", "this")).toBe(true);
        });

        test("should match single wildcard `*` (outer based)", () => {
            const hostname = new Hostname("sub.example.com", { format: "fqdn" });
            expect(hostname.match("*.example.com", "outer")).toBe(true);
            expect(hostname.match("another.example.com", "outer")).toBe(false);
        });

        test("should match double wildcard `**` (outer based)", () => {
            const hostname = new Hostname("deep.sub.example.com", { format: "fqdn" });
            expect(hostname.match("**.example.com", "outer")).toBe(true);
            expect(hostname.match("example.com", "outer")).toBe(false);
        });

        test("should match IPv4 with wildcard", () => {
            const hostname = new Hostname("192.168.*.*", { format: "ipv4" });
            expect(hostname.match("192.168.1.1", "this")).toBe(true);
            expect(hostname.match("192.168.100.200", "this")).toBe(true);
            expect(hostname.match("192.169.1.1", "this")).toBe(false);
        });

        test("should match IPv6 with wildcard", () => {
            const hostname = new Hostname("2001:db8::**", { format: "ipv6" });
            expect(hostname.match("2001:db8::1", "this")).toBe(true);
            expect(hostname.match("2001:db8::ff00:42:8329", "this")).toBe(true);
            expect(hostname.match("2001:abcd::1", "this")).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        test("should correctly handle `*.*.*.*` IPv4 pattern", () => {
            const hostname = new Hostname("*.*.*.*", { format: "ipv4" });
            expect(hostname.match("10.20.30.40", "this")).toBe(true);
            expect(hostname.match("255.255.255.255", "this")).toBe(true);
            expect(hostname.match("10.20.30", "this")).toBe(false);
        });

        test("should correctly handle `**.example.com` for deeply nested subdomains", () => {
            const hostname = new Hostname("**.example.com", { format: "fqdn" });
            expect(hostname.match("a.b.c.d.example.com", "this")).toBe(true);
            expect(hostname.match("b.example.com", "this")).toBe(true);
            expect(hostname.match("example.com", "this")).toBe(true);
        });

        test("should reject incorrect hostname formats", () => {
            expect(() => new Hostname("-invalid.com", { format: "fqdn" })).toThrow();
            expect(() => new Hostname("invalid..com", { format: "fqdn" })).toThrow();
            expect(() => new Hostname("12345", { format: "fqdn" })).toThrow();
        });

        test("should reject unmatched hostnames", () => {
            const hostname = new Hostname("example.com", { format: "fqdn" });
            expect(hostname.match("different.com", "this")).toBe(false);
        });
    });
});
