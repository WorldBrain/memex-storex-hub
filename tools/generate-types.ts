const pluralize = require('pluralize')
import { StorageRegistry, CollectionDefinitionMap } from '@worldbrain/storex'
import { generateTypescriptInterfaces } from '@worldbrain/storex-typescript-generation'
import { writeFileSync } from 'fs'
import { MEMEX_COLLECTION_DEFINITION_MAPS } from '../ts/testing/constants'

function singularCollectionDefinitions(collectionDefinitions: CollectionDefinitionMap) {
    const singular: CollectionDefinitionMap = {}
    for (const key of Object.keys(collectionDefinitions)) {
        singular[pluralize.singular(key)] = collectionDefinitions[key]
    }
    return singular
}

function renameCollection(collectionDefinitions: CollectionDefinitionMap, source: string, target: string) {
    if (source in collectionDefinitions) {
        collectionDefinitions[target] = collectionDefinitions[source]
        delete collectionDefinitions[source]
    }
}

async function main() {
    const registry = new StorageRegistry()
    const definitions: CollectionDefinitionMap[] = MEMEX_COLLECTION_DEFINITION_MAPS
    for (const definitionMap of definitions) {
        const singularDefinitions = singularCollectionDefinitions(definitionMap)
        renameCollection(singularDefinitions, 'annotBookmark', 'annotationBookmark')
        renameCollection(singularDefinitions, 'annotListEntry', 'annotationListEntry')
        registry.registerCollections(singularDefinitions)
    }
    await registry.finishInitialization()

    const types = generateTypescriptInterfaces(registry, {
        autoPkType: 'generic',
        collections: Object.keys(registry.collections),
        fieldTypeMap: {
            blob: 'any',
            text: 'string',
            string: 'string',
            json: 'any',
            datetime: 'Date',
            timestamp: 'number',
            int: 'number',
            boolean: 'boolean',
            float: 'number',
        }
    })

    writeFileSync('./ts/types/storex-types.ts', types)
}

if (require.main === module) {
    main()
}
