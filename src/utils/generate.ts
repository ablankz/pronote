import { v7 as uuidv7 } from "uuid";

export function generateInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function generateColor(name: string) {
  const colors = ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500", "bg-purple-500"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function generateUniqueID() {
  return crypto.randomUUID();
}

export function generateSortableUniqueID(): string {
  return uuidv7();
}