import StorageManager, { StorageRegistry, CollectionDefinition, CollectionDefinitionMap } from '@worldbrain/storex';
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import { ChangeWatchMiddleware } from '@worldbrain/storex-middleware-change-watcher'
import { MultiApiOptions, TestSession } from "@worldbrain/storex-hub/lib/tests/api/index.tests";
import * as api from "@worldbrain/storex-hub/lib/public-api";
import { MEMEX_COLLECTION_DEFINITION_MAPS } from './constants';

export class MemexTestingApp {
    session?: TestSession
    storageManager?: StorageManager
    collectionsToWatch = new Set<string>()
    subscriptionCount = 0

    constructor(private createSession: (options: MultiApiOptions) => Promise<TestSession>) {
    }

    async setup() {
        const idbImplementation = inMemory()
        const storageBackend = new DexieStorageBackend({ dbName: 'test', idbImplementation })
        this.storageManager = new StorageManager({ backend: storageBackend })
        for (const colllectionDefinitions of MEMEX_COLLECTION_DEFINITION_MAPS) {
            this.storageManager.registry.registerCollections(colllectionDefinitions)
        }
        await this.storageManager.finishInitialization()
        this.storageManager.setMiddleware([
            new ChangeWatchMiddleware({
                storageManager: this.storageManager,
                shouldWatchCollection: name => this.collectionsToWatch.has(name),
                postprocessOperation: async info => {
                    if (this.session) {
                        await this.session.api.emitEvent({
                            event: {
                                type: 'storage-change',
                                info: info.info,
                            }
                        })
                    }
                }
            })
        ])
    }

    async connect() {
        if (!this.storageManager) {
            await this.setup()
        }

        let memexSubscriptions: { [id: string]: api.RemoteStorageChangeSubscriptionRequest_v0 } = {}
        this.session = await this.createSession({
            type: 'websocket',
            callbacks: {
                handleRemoteOperation: async ({ operation }) => {
                    const result = await this.storageManager!.operation(operation[0], ...operation.slice(1))
                    return { result }
                },
                handleSubscription: async ({ request }) => {
                    const subscriptionId = (this.subscriptionCount++).toString()
                    memexSubscriptions[subscriptionId] = request
                    if (request.type === 'storage-change') {
                        for (const collection of request.collections || []) {
                            this.collectionsToWatch.add(collection)
                        }
                    }

                    return { subscriptionId }
                },
                handleUnsubscription: async ({ subscriptionId }) => {
                    delete memexSubscriptions[subscriptionId]
                }
            }
        })
        await this.session.api.registerApp({ name: 'memex', identify: true, remote: true })
    }

    async disconnect() {
        await this.session?.api?.destroySession?.()
        await this.session?.close?.()
    }
}
