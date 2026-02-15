import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface FolderOffer {
    id: bigint;
    offerType: OfferType;
    originalPrice: number;
    validFrom: Time;
    valid: boolean;
    productName: string;
    imageUrl: string;
    category: ProductCategory;
    brand?: string;
    supermarket: Supermarket;
    validUntil: Time;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface FilterOptions {
    category?: ProductCategory;
    brand?: string;
    supermarket?: Supermarket;
}
export interface UserLocation {
    latitude: number;
    longitude: number;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Review {
    comment?: string;
    timestamp: Time;
    rating: bigint;
    reviewer: Principal;
    sharedPaymentId: bigint;
}
export interface UserProductOverview {
    sharedProducts: Array<SelectedProductDetail>;
    onlyCurrentUser: Array<SelectedProductDetail>;
}
export interface SelectedProductDetail {
    matchedUsers: Array<Principal>;
    product: FolderOffer;
}
export interface UserReviews {
    reviews: Array<Review>;
    averageRating: number;
    reviewCount: bigint;
}
export interface Match {
    createdAt: Time;
    user1: Principal;
    user2: Principal;
    offerId: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type NotificationType = {
    __kind__: "productMatch";
    productMatch: {
        matchedUser: Principal;
        offerId: bigint;
    };
};
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Notification {
    id: bigint;
    notificationType: NotificationType;
    createdAt: Time;
    user: Principal;
    isRead: boolean;
}
export interface SharedPayment {
    paymentMethod: PaymentMethod;
    initiator: Principal;
    invitationId: bigint;
    completed: boolean;
    participant: Principal;
    offerId: bigint;
    amount: number;
}
export interface UserProfile {
    nearestSupermarket?: Supermarket;
    birthDate?: Time;
    preferredCategories: Array<ProductCategory>;
    city: string;
    name: string;
    profilePhoto?: ExternalBlob;
    email: string;
    meetingSupermarket?: Supermarket;
    timestamp: Time;
    preferredSupermarkets: Array<Supermarket>;
    location?: UserLocation;
}
export enum OfferType {
    onePlusOneFree = "onePlusOneFree"
}
export enum PaymentMethod {
    cash = "cash",
    debitCard = "debitCard"
}
export enum ProductCategory {
    vlees = "vlees",
    bakkerij = "bakkerij",
    zuivel = "zuivel",
    snacks = "snacks",
    overig = "overig",
    groentenFruit = "groentenFruit",
    dranken = "dranken"
}
export enum Supermarket {
    dekamarkt = "dekamarkt",
    aldi = "aldi",
    deen = "deen",
    dirk = "dirk",
    lidl = "lidl",
    spar = "spar",
    jumbo = "jumbo",
    albertHeijn = "albertHeijn"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavoriteOffer(offerId: bigint): Promise<void>;
    addMultipleFavoriteOffers(offerIds: Array<bigint>): Promise<void>;
    addUserSelectedProducts(productIds: Array<bigint>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createSharedPaymentInvitation(participant: Principal, offerId: bigint, amount: number, paymentMethod: PaymentMethod): Promise<bigint>;
    fetchOffersFromAlbertHeijn(): Promise<void>;
    fetchOffersFromJumbo(): Promise<void>;
    fetchOffersFromLidl(): Promise<void>;
    getAllOffersWithFilters(_filters: FilterOptions): Promise<Array<FolderOffer>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavoriteOfferIds(): Promise<Array<bigint>>;
    getFavoriteOffers(): Promise<Array<FolderOffer>>;
    getOffers(_filters: FilterOptions): Promise<Array<FolderOffer>>;
    getProductMatches(user: Principal): Promise<Array<Match>>;
    getProductMatchesForUser(user: Principal): Promise<Array<Match>>;
    getSharedOfferPayments(user: Principal): Promise<Array<SharedPayment>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTestLink(): Promise<string>;
    getUserFavorites(user: Principal): Promise<Array<FolderOffer>>;
    getUserNotifications(): Promise<Array<Notification>>;
    getUserProductOverview(user: Principal): Promise<UserProductOverview>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserReviews(user: Principal): Promise<UserReviews>;
    getUserSelectedProducts(user: Principal): Promise<Array<FolderOffer>>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isVersion61Active(): Promise<boolean>;
    leaveReview(toUser: Principal, sharedPaymentId: bigint, rating: bigint, comment: string | null): Promise<void>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    removeFavoriteOffer(offerId: bigint): Promise<void>;
    removeProfilePhoto(): Promise<void>;
    respondToPaymentInvitation(invitationId: bigint, accept: boolean): Promise<void>;
    restart(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchOffers(_searchText: string): Promise<Array<FolderOffer>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    uploadProfilePhoto(photo: ExternalBlob): Promise<void>;
}
