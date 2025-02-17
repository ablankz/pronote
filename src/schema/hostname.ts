export type HostnameFormatType =
    | "fqdn"        // Fully Qualified Domain Name, e.g. www.example.com
    | "shortname"   // localhost, server01, etc.
    | "ipv4"        // 192.168.0.1, etc.
    | "ipv6"        // 2001:0db8:85a3:0000:0000:8a2e:0370:7334, etc.
    | "custom";     // Custom format

export interface HostnameSchema {
    format?: HostnameFormatType;
}

export class Hostname {
    private original: string;
    private type: HostnameFormatType;

    constructor(host: string, schema: HostnameSchema) {
        this.original = host;
        const ipv4Regex = /^(([*]|25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}([*]|25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;
        const ipv6Regex = /^((([*]|[0-9a-fA-F]{1,4}):){7,7}([*]|[0-9a-fA-F]{1,4})|(([*]|[0-9a-fA-F]{1,4}):){1,7}:|(([*]|[0-9a-fA-F]{1,4}):){1,6}:([*]|[0-9a-fA-F]{1,4})|(([*]|[0-9a-fA-F]{1,4}):){1,5}(:([*]|[0-9a-fA-F]{1,4})){1,2}|(([*]|[0-9a-fA-F]{1,4}):){1,4}(:([*]|[0-9a-fA-F]{1,4})){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:([*]|[0-9a-fA-F]{1,4})){1,4}|(([*]|[0-9a-fA-F]{1,4}):){1,2}(:([*]|[0-9a-fA-F]{1,4})){1,5}|([*]|[0-9a-fA-F]{1,4}):((:([*]|[0-9a-fA-F]{1,4})){1,6})|:((:([*]|[0-9a-fA-F]{1,4})){1,7}|:)|fe80:(:([*]|[0-9a-fA-F]{0,4})){0,4}%([*]|[0-9a-zA-Z]{1,})|::(ffff(:0{1,4}){0,1}:){0,1}(([*]|25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}([*]|25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(([*]|[0-9a-fA-F]{1,4}):){1,4}:(([*]|25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}([*]|25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        const fqdnRegex = /^(([a-zA-Z0-9*][a-zA-Z0-9*\-]*[a-zA-Z0-9*])|[a-zA-Z0-9*]+\.)*([a-zA-Z*]+|xn\-\-[a-zA-Z0-9*]+)\.?$/
        const shortnameRegex = /^[a-zA-Z0-9*-]+$/;        
        const customRegex = new RegExp(".*");
        const containsWildcard = host.includes("**");

        if (schema.format === undefined) {
            if (ipv4Regex.test(host)) {
                this.type = "ipv4";
            } else if (ipv6Regex.test(host)) {
                this.type = "ipv6";
            } else if (fqdnRegex.test(host)) {
                this.type = "fqdn";
            } else if (shortnameRegex.test(host)) {
                this.type = "shortname";
            } else if (customRegex.test(host)) {
                this.type = "custom";
            } else {
                throw new Error(`Invalid hostname: ${host}`);
            }
        } else {
            switch (schema.format) {
                case "ipv4":
                    if (!containsWildcard && !ipv4Regex.test(host)) {
                        throw new Error(`Invalid IPv4 address: ${host}`);
                    }
                    this.type = "ipv4";
                    break;
                case "ipv6":
                    if (!containsWildcard && !ipv6Regex.test(host)) {
                        throw new Error(`Invalid IPv6 address: ${host}`);
                    }
                    this.type = "ipv6";
                    break;
                case "fqdn":
                    if (!containsWildcard && !fqdnRegex.test(host)) {
                        throw new Error(`Invalid FQDN: ${host}`);
                    }
                    this.type = "fqdn";
                    break;
                case "shortname":
                    if (!containsWildcard && !shortnameRegex.test(host)) {
                        throw new Error(`Invalid shortname: ${host}`);
                    }
                    this.type = "shortname";
                    break;
                case "custom":
                    if (!containsWildcard && !customRegex.test(host)) {
                        throw new Error(`Invalid custom hostname: ${host}`);
                    }
                    this.type = "custom";
                    break;
                default:
                    throw new Error(`Invalid hostname format: ${schema.format}`);
            }
        }
    }

    getHostname(): string {
        return this.original;
    }

    match(hostname: string, base: "this" | "outer" = "outer"): boolean {
        let parts: string[], splitValue: string[];
        switch (this.type) {
            case "ipv4":
            case "fqdn":
                parts = base === "this" ? this.original.split(".") : hostname.split(".");
                splitValue = base === "this" ? hostname.split(".") : this.original.split(".");
                break;
            case "ipv6":
                parts = base === "this" ? this.original.split(":") : hostname.split(":");
                splitValue = base === "this" ? hostname.split(":") : this.original.split(":");
                break;
            case "shortname":
                parts = base === "this" ? this.original.split("/") : hostname.split("/");
                splitValue = base === "this" ? hostname.split("/") : this.original.split("/");
                break;
            case "custom":
                parts = base === "this" ? this.original.split("/") : hostname.split("/");
                splitValue = base === "this" ? hostname.split("/") : this.original.split("/");
                break;
            default:
                return false;
        }

        let j = 0;
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "**") {
                if (i === parts.length - 1) {
                    return true;
                }
                i++;
                const next = parts[i];
                if (next === "**") {
                    i--;
                    continue;
                }
                let found = false;
                if (next.includes("*")) {
                    const regexStr = next
                        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                        .replace(/\*/g, ".*");
                    const regex = new RegExp(`^${regexStr}$`);
                    let k = splitValue.length - 1;
                    while (k >= j) {
                        if (regex.test(splitValue[k])) {
                            found = true;
                            j = k;
                            break;
                        }
                        k--;
                    }
                } else {
                    let k = splitValue.length - 1;
                    while (k >= j) {
                        if (splitValue[k] === next) {
                            found = true;
                            j = k;
                            break;
                        }
                        k--;
                    }
                }
                if (!found) {
                    return false;
                }
            }

            if (parts[i].includes("*")) {
                const regexStr = parts[i]
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\*/g, ".*");
                const regex = new RegExp(`^${regexStr}$`);
                if (!regex.test(splitValue[j])) {
                    return false;
                }
            } else {
                if (parts[i] !== splitValue[j]) {
                    return false;
                }
            }
            j++;
        }

        return j === splitValue.length;
    }

    getType(): HostnameFormatType {
        return this.type;
    }
}
