export type Annotation =
    { url: number | string } &
    {
        pageTitle: string
        pageUrl: string
        body?: string
        comment?: string
        selector?: any
        createdWhen: Date
        lastEdited: Date
    }

export type AnnotationBookmark =
    { url: number | string } &
    {
        createdAt: Date
    }

export type AnnotationListEntry =
    {
        listId: number
        url: string
        createdAt: Date
    }

export type Page =
    { url: number | string } &
    {
        fullUrl: string
        domain: string
        hostname: string
        fullTitle?: string
        text?: string
        screenshot?: any
        lang?: string
        canonicalUrl?: string
        description?: string
    }

export type Visit =
    {
        url: string
        time: number
        duration?: number
        scrollMaxPerc?: number
        scrollMaxPx?: number
        scrollPerc?: number
        scrollPx?: number
    }

export type Bookmark =
    { url: number | string } &
    {
        time: number
    }

export type FavIcon =
    { hostname: number | string } &
    {
        favIcon: any
    }

export type Tag =
    {
        url: string
        name: string
    }

export type CustomList =
    { id: number | string } &
    {
        name: string
        isDeletable?: boolean
        isNestable?: boolean
        createdAt: Date
    }

export type PageListEntry =
    {
        listId: number
        pageUrl: string
        fullUrl: string
        createdAt: Date
    }
