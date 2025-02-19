export type SchemaBasedTransformationPolicy =
    // Old operations are discarded
    // e.g. numState: 3, 
    // 1. host1.applyLocalEdit(NumericOperation.add(1))
    // 2. host2.applyLocalEdit(NumericOperation.sub(2))
    // 3. server.mergeLocalEdit(host1)
    // 4. server.mergeLocalEdit(host2)
    // 5. host1.mergeRemoteEdit(server)
    // 6. host2.mergeRemoteEdit(server)
    // 1->2->3->4->5->6: host1: 1, host2: 1, server: 1
    // 2->1->3->4->5->6: host1: 4, host2: 4, server: 4
    // 1->3->5->6->2->4: host1: 4, host2: 2, server: 2
    | "BTP_DISCARD_OLD_OPERATIONS"
    // Always merge the latest operation
    // e.g. numState: 3,
    // 1. host1.applyLocalEdit(NumericOperation.apply(10))
    // 2. host2.applyLocalEdit(NumericOperation.apply(20))
    // 3. server.mergeLocalEdit(host1)
    // 4. server.mergeLocalEdit(host2)
    // 5. host1.mergeRemoteEdit(server)
    // 6. host2.mergeRemoteEdit(server)
    // 1->2->3->4->5->6: host1: 20, host2: 20, server: 20
    // 2->1->3->4->5->6: host1: 10, host2: 10, server: 10
    // 1->3->5->6->2->4: host1: 10, host2: 20, server: 20
    | "BTP_KEEP_LATEST_STATE"
    // Merge the best effort state if it is valid
    // if the state is invalid, the remote operation is discarded
    // e.g. strState: "hello",
    // host1: hello, world, server: Hello -> Hello, world
    // host1: aaa, server: Hello -> aaa
    // host1: aaa, server: bbb -> aaa
    | "BTP_MERGE_STATE_WITH_LOCAL_PREFERENCE"
    // Merge the best effort state if it is valid
    // if the state is invalid, the local operation is discarded
    // e.g. strState: "hello",
    // host1: hello, world, server: Hello -> Hello, world
    // host1: aaa, server: Hello -> aaa
    // host1: aaa, server: bbb -> bbb
    | "BTP_MERGE_STATE_WITH_REMOTE_PREFERENCE"
    // Merge the best effort state if it is valid
    // if the state is invalid, the two operations are discarded
    // e.g. strState: "hello",
    // host1: hello, world, server: Hello -> Hello, world
    // host1: aaa, server: Hello -> aaa
    // host1: aaa, server: bbb -> hello
    // Merge the latest operation if it is valid
    | "BTP_MERGE_STATE_WITH_OLD_PREFERENCE"
    // Merge the best effort operation if it is valid
    // e.g. numState: 3,
    // 1. host1.applyLocalEdit(NumericOperation.add(1))
    // 2. host2.applyLocalEdit(NumericOperation.sub(2))
    // 3. server.mergeLocalEdit(host1)
    // 4. server.mergeLocalEdit(host2)
    // 5. host1.mergeRemoteEdit(server)
    // 6. host2.mergeRemoteEdit(server)
    // 1->2->3->4->5->6: host1: 2, host2: 2, server: 2
    // 2->1->3->4->5->6: host1: 2, host2: 2, server: 2
    // 1->3->5->6->2->4: host1: 4, host2: 2, server: 2
    | "BTP_MERGE_OPERATION_IF_VALID";