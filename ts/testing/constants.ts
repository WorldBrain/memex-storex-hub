import { CollectionDefinitionMap } from '@worldbrain/storex'
import * as memexAnnotations from '@worldbrain/memex-storage/lib/annotations/constants'
import * as memexPages from '@worldbrain/memex-storage/lib/pages/constants'
import * as memexTags from '@worldbrain/memex-storage/lib/tags/constants'
import * as memexLists from '@worldbrain/memex-storage/lib/lists/constants'

export const MEMEX_COLLECTION_DEFINITION_MAPS: CollectionDefinitionMap[] = [
    memexAnnotations.COLLECTION_DEFINITIONS,
    memexPages.COLLECTION_DEFINITIONS,
    memexTags.COLLECTION_DEFINITIONS,
    memexLists.COLLECTION_DEFINITIONS,
]
