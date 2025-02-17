// Single Value
export class SingleType<T> {
    private value: T;

    constructor(value: T) {
        this.value = value;
    }

    getValue(): T {
        return this.value;
    }

    setValue(value: T): void {
        this.value = value;
    }
}

// Array Type
export class ArrayType<T> {
    private data: T[] = [];

    constructor(data: T[] = []) {
        this.data = data;
    }

    push(value: T): void {
        this.data.push(value);
    }

    pop(): T | undefined {
        return this.data.pop();
    }

    shift(): T | undefined {
        return this.data.shift();
    }

    unshift(value: T): void {
        this.data.unshift(value);
    }

    get(index: number): T | undefined {
        return this.data[index];
    }

    set(index: number, value: T): void {
        this.data[index] = value;
    }

    delete(index: number): void {
        this.data.splice(index, 1);
    }

    getValues(): T[] {
        return this.data;
    }
}

// Record Type
export class RecordType<K extends string, V> {
    private data: Record<K, V> = {} as Record<K, V>;

    constructor(data: Record<K, V>) {
        this.data = data;
    }

    set(key: K, value: V): void {
        this.data[key] = value;
    }

    get(key: K): V | undefined {
        return this.data[key];
    }

    has(key: K): boolean {
        return key in this.data;
    }

    delete(key: K): void {
        delete this.data[key];
    }

    getKeys(): K[] {
        return Object.keys(this.data) as K[];
    }

    getValues(): V[] {
        return Object.values(this.data);
    }
}

// Map Type
export class MapType<K, V> {
    private data: Map<K, V> = new Map();

    constructor(data: [K, V][]) {
        this.data = new Map(data);
    }

    set(key: K, value: V): void {
        this.data.set(key, value);
    }

    get(key: K): V | undefined {
        return this.data.get(key);
    }

    has(key: K): boolean {
        return this.data.has(key);
    }

    delete(key: K): boolean {
        return this.data.delete(key);
    }

    getKeys(): K[] {
        return Array.from(this.data.keys());
    }

    getValues(): V[] {
        return Array.from(this.data.values());
    }
}

// Set Type
export class SetType<T> {
    private data: Set<T> = new Set();

    constructor(data: T[]) {
        this.data = new Set(data);
    }

    add(value: T): void {
        this.data.add(value);
    }

    delete(value: T): boolean {
        return this.data.delete(value);
    }

    has(value: T): boolean {
        return this.data.has(value);
    }

    getValues(): T[] {
        return Array.from(this.data);
    }
}

// Tuple Type
export class TupleType<T extends unknown[]> {
    private data: T;

    constructor(data: T) {
        this.data = data;
    }

    get(index: number): T[number] {
        return this.data[index];
    }

    set(index: number, value: T[number]): void {
        this.data[index] = value;
    }

    getValues(): T {
        return this.data;
    }
}

// Stack Type (LIFO)
export class Stack<T> {
    private items: T[] = [];

    constructor(items: T[] = []) {
        this.items = items;
    }

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

// Queue Type (FIFO)
export class Queue<T> {
    private items: T[] = [];

    constructor(items: T[] = []) {
        this.items = items;
    }

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    front(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

// Linked List Node
export class LinkedListNode<T> {
    value: T;
    next: LinkedListNode<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}

// Linked List
export class LinkedList<T> {
    private head: LinkedListNode<T> | null = null;

    constructor(values: T[] = []) {
        for (const value of values) {
            this.append(value);
        }
    }

    append(value: T): void {
        const newNode = new LinkedListNode(value);
        if (!this.head) {
            this.head = newNode;
            return;
        }
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
    }

    find(value: T): LinkedListNode<T> | null {
        let current = this.head;
        while (current) {
            if (current.value === value) return current;
            current = current.next;
        }
        return null;
    }
}

// Tree Node
export class TreeNode<T> {
    value: T;
    children: TreeNode<T>[] = [];

    constructor(value: T) {
        this.value = value;
    }

    addChild(node: TreeNode<T>): void {
        this.children.push(node);
    }
}

// Tree Structure
export class Tree<T> {
    root: TreeNode<T>;

    constructor(rootValue: T) {
        this.root = new TreeNode(rootValue);
    }

    getRoot(): TreeNode<T> {
        return this.root;
    }
}

// Graph Node
export class GraphNode<T> {
    value: T;
    edges: GraphNode<T>[] = [];

    constructor(value: T) {
        this.value = value;
    }

    connect(node: GraphNode<T>): void {
        this.edges.push(node);
        node.edges.push(this);
    }
}

// Graph Structure
export class Graph<T> {
    private nodes: Map<T, GraphNode<T>> = new Map();

    constructor(values: T[] = []) {
        for (const value of values) {
            this.addNode(value);
        }
    }

    addNode(value: T): GraphNode<T> {
        if (!this.nodes.has(value)) {
            this.nodes.set(value, new GraphNode(value));
        }
        return this.nodes.get(value)!;
    }

    connectNodes(value1: T, value2: T): void {
        const node1 = this.addNode(value1);
        const node2 = this.addNode(value2);
        node1.connect(node2);
    }

    getNodes(): GraphNode<T>[] {
        return Array.from(this.nodes.values());
    }
}
