import expect from 'expect'
import { createMultiApiTestSuite } from '@worldbrain/storex-hub/lib/tests/api/index.tests'
import { MemexTestingApp } from '.'
import { Tag } from '../types/storex-types'
import { ClientEvent } from '@worldbrain/storex-hub/lib/public-api'

createMultiApiTestSuite('Memex + Storex Hub', ({ it }) => {
    it('should execute remote operations', async ({ createSession }) => {
        const memex = new MemexTestingApp(createSession)
        await memex.connect()
        const tag: Tag = { name: 'foo', url: 'test.com/foo' }
        await memex.storageManager!.operation('createObject', 'tags', { ...tag })

        const testApp = await createSession({
            type: 'websocket',
        })
        await testApp.api.registerApp({
            name: 'test',
            identify: true,
        })
        const tagsResult = await testApp.api.executeRemoteOperation({
            app: 'memex',
            operation: ['findObjects', 'tags', { name: 'foo' }],
        })
        expect(tagsResult).toEqual({
            status: 'success',
            result: [tag]
        })
    })

    it('should detect changes in Memex', async ({ createSession }) => {
        const memex = new MemexTestingApp(createSession)
        await memex.connect()

        const receivedEvents: ClientEvent[] = []
        const testApp = await createSession({
            type: 'websocket',
            callbacks: {
                handleEvent: async ({ event }) => {
                    receivedEvents.push(event)
                }
            }
        })
        const subscriptionResult = await testApp.api.subscribeToEvent({
            request: {
                type: 'storage-change',
                app: 'memex',
                collections: ['tags'],
            }
        })
        expect(subscriptionResult).toEqual({
            status: 'success',
            subscriptionId: expect.any(String),
        })

        const tag: Tag = { name: 'foo', url: 'test.com/foo' }
        await memex.storageManager!.operation('createObject', 'tags', { ...tag })
        expect(receivedEvents).toEqual([{
            type: 'storage-change',
            app: 'memex',
            info: {
                changes: [{
                    collection: "tags",
                    pk: [
                        "foo",
                        "test.com/foo",
                    ],
                    type: "create",
                    values: {},
                }]
            }
        }])
    })

    it('should detect Memex availability', async ({ createSession }) => {
        const receivedEvents: ClientEvent[] = []
        const testApp = await createSession({
            type: 'websocket',
            callbacks: {
                handleEvent: async ({ event }) => {
                    receivedEvents.push(event)
                }
            }
        })
        await testApp.api.registerApp({
            name: 'test',
            identify: true,
        })
        await testApp.api.subscribeToEvent({
            request: {
                type: 'app-availability-changed'
            }
        })

        expect(receivedEvents).toEqual([])

        const memex = new MemexTestingApp(createSession)
        await memex.connect()

        const firstEvent: ClientEvent = {
            type: 'app-availability-changed',
            app: 'memex',
            availability: true,
        }
        expect(receivedEvents).toEqual([
            firstEvent
        ])

        await memex.disconnect()
        const secondEvent = { ...firstEvent, availability: false }
        expect(receivedEvents).toEqual([firstEvent, secondEvent])
    })
})
