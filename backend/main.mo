import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Set "mo:core/Set";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let version61Active = true;

  type Supermarket = {
    #albertHeijn;
    #jumbo;
    #lidl;
    #dekamarkt;
    #aldi;
    #spar;
    #dirk;
    #deen;
  };

  module Supermarket {
    public func compare(a : Supermarket, b : Supermarket) : Order.Order {
      switch (a, b) {
        case (#albertHeijn, #albertHeijn) { #equal };
        case (#albertHeijn, _) { #less };
        case (#jumbo, #albertHeijn) { #greater };
        case (#jumbo, #jumbo) { #equal };
        case (#jumbo, _) { #less };
        case (#lidl, #lidl) { #equal };
        case (#lidl, _) { #greater };
        case (#dekamarkt, #dekamarkt) { #equal };
        case (#dekamarkt, _) { #less };
        case (#aldi, #aldi) { #equal };
        case (#aldi, _) { #less };
        case (#spar, #spar) { #equal };
        case (#spar, _) { #less };
        case (#dirk, #dirk) { #equal };
        case (#dirk, _) { #greater };
        case (#deen, #deen) { #equal };
        case (#deen, _) { #greater };
      };
    };
  };

  type ProductCategory = {
    #groentenFruit;
    #vlees;
    #zuivel;
    #dranken;
    #bakkerij;
    #snacks;
    #overig;
  };

  module ProductCategory {
    public func compare(cat1 : ProductCategory, cat2 : ProductCategory) : Order.Order {
      switch (cat1, cat2) {
        case (#groentenFruit, #groentenFruit) { #equal };
        case (#groentenFruit, _) { #less };
        case (#vlees, #groentenFruit) { #greater };
        case (#vlees, #vlees) { #equal };
        case (#vlees, _) { #less };
        case (#zuivel, #bakkerij) { #less };
        case (#zuivel, #zuivel) { #equal };
        case (#zuivel, _) { #greater };
        case (#dranken, #groentenFruit) { #greater };
        case (#dranken, #vlees) { #greater };
        case (#dranken, #dranken) { #equal };
        case (#dranken, _) { #less };
        case (#bakkerij, #groentenFruit) { #greater };
        case (#bakkerij, #bakkerij) { #equal };
        case (#bakkerij, _) { #less };
        case (#snacks, #groentenFruit) { #greater };
        case (#snacks, #vlees) { #greater };
        case (#snacks, #zuivel) { #greater };
        case (#snacks, #dranken) { #greater };
        case (#snacks, #snacks) { #equal };
        case (#snacks, _) { #less };
        case (#overig, #overig) { #equal };
        case (#overig, _) { #greater };
      };
    };
  };

  type OfferType = { #onePlusOneFree };

  type SourceStatus = {
    url : Text;
    active : Bool;
    lastSync : ?Time.Time;
    errorMessage : ?Text;
  };

  type FolderOffer = {
    id : Nat;
    productName : Text;
    originalPrice : Float;
    supermarket : Supermarket;
    category : ProductCategory;
    brand : ?Text;
    validFrom : Time.Time;
    validUntil : Time.Time;
    imageUrl : Text;
    offerType : OfferType;
    valid : Bool;
  };

  type UserLocation = {
    latitude : Float;
    longitude : Float;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    city : Text;
    preferredSupermarkets : [Supermarket];
    preferredCategories : [ProductCategory];
    location : ?UserLocation;
    nearestSupermarket : ?Supermarket;
    meetingSupermarket : ?Supermarket;
    timestamp : Time.Time;
    profilePhoto : ?Storage.ExternalBlob;
    birthDate : ?Time.Time;
  };

  type FilterOptions = {
    supermarket : ?Supermarket;
    category : ?ProductCategory;
    brand : ?Text;
  };

  type PaymentMethod = {
    #cash;
    #debitCard;
  };

  type PaymentInvitationStatus = {
    #pending;
    #accepted;
    #rejected;
  };

  type SharedPaymentInvitation = {
    id : Nat;
    initiator : Principal;
    participant : Principal;
    offerId : Nat;
    amount : Float;
    paymentMethod : PaymentMethod;
    status : PaymentInvitationStatus;
    createdAt : Time.Time;
  };

  type SharedPayment = {
    invitationId : Nat;
    initiator : Principal;
    participant : Principal;
    offerId : Nat;
    amount : Float;
    paymentMethod : PaymentMethod;
    completed : Bool;
  };

  type Review = {
    reviewer : Principal;
    rating : Nat;
    comment : ?Text;
    timestamp : Time.Time;
    sharedPaymentId : Nat;
  };

  type UserReviews = {
    reviews : [Review];
    averageRating : Float;
    reviewCount : Nat;
  };

  type Match = {
    user1 : Principal;
    user2 : Principal;
    offerId : Nat;
    createdAt : Time.Time;
  };

  type NotificationType = {
    #productMatch : {
      matchedUser : Principal;
      offerId : Nat;
    };
  };

  type Notification = {
    id : Nat;
    user : Principal;
    notificationType : NotificationType;
    isRead : Bool;
    createdAt : Time.Time;
  };

  type SelectedProductDetail = {
    product : FolderOffer;
    matchedUsers : [Principal];
  };

  type UserProductOverview = {
    onlyCurrentUser : [SelectedProductDetail];
    sharedProducts : [SelectedProductDetail];
  };

  type FolderSyncStatus = {
    sourceStatus : [SourceStatus];
    lastGlobalSync : ?Time.Time;
  };

  type FolderUpdate = {
    offer : FolderOffer;
    valid : Bool;
  };

  var EMPTY_IMAGE_URL = "product-placeholder.dim_200x200.png";

  func sanitizeImageUrl(imageUrl : Text) : Text {
    switch (imageUrl.trim(#char(' '))) {
      case (t) {
        if (t == "" or t.contains(#text("["))) {
          EMPTY_IMAGE_URL;
        } else {
          t;
        };
      };
    };
  };

  let offers = Map.empty<Nat, FolderOffer>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sharedPayments = Map.empty<Nat, SharedPayment>();
  var paymentInvitations = Map.empty<Nat, SharedPaymentInvitation>();
  let userReviews = Map.empty<Principal, UserReviews>();
  let favorites = Map.empty<Principal, Set.Set<Nat>>();
  let matches = Map.empty<Nat, Match>();
  let notifications = Map.empty<Nat, Notification>();
  let userProducts = Map.empty<Principal, Set.Set<Nat>>();
  var nextInvitationId : Nat = 1;
  var nextPaymentId : Nat = 1;
  var matchCounter : Nat = 0;
  var notificationCounter : Nat = 0;
  let TEST_LINK = "https://buddydeals-preview.dfx.dev/";
  let accessControlState = AccessControl.initState();

  // =====================================================================
  // ACCESS CONTROL
  // =====================================================================

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // =====================================================================
  // PUBLIC FUNCTIONS (ACCESSIBLE TO ALL INCLUDING GUESTS)
  // =====================================================================

  public query func isStripeConfigured() : async Bool {
    // Public access - configuration status check
    configuration != null;
  };

  public query func getTestLink() : async Text {
    // Public access - test link for sharing
    TEST_LINK;
  };

  public query func isVersion61Active() : async Bool {
    // Public access - version check
    version61Active;
  };

  public query func getUserReviews(user : Principal) : async UserReviews {
    // Public access - reviews are publicly viewable for transparency
    switch (userReviews.get(user)) {
      case (null) {
        {
          reviews = [];
          averageRating = 0;
          reviewCount = 0;
        };
      };
      case (?reviews) { reviews };
    };
  };

  // Transform function for HTTP outcalls - must be public for IC system to call
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    // This function is called by the IC system during HTTP outcalls
    // It must remain public without authentication checks
    OutCall.transform(input);
  };

  // =====================================================================
  // USER-ONLY FUNCTIONS
  // =====================================================================

  public query ({ caller }) func getOffers(_filters : FilterOptions) : async [FolderOffer] {
    // Users must be authenticated to view offers (per specification requirement)
    checkUser(caller);
    offers.values().toArray();
  };

  public query ({ caller }) func getAllOffersWithFilters(_filters : FilterOptions) : async [FolderOffer] {
    // Users must be authenticated to view offers (per specification requirement)
    checkUser(caller);
    offers.values().toArray();
  };

  public query ({ caller }) func searchOffers(_searchText : Text) : async [FolderOffer] {
    // Users must be authenticated to search
    checkUser(caller);
    Runtime.trap("Zoeken is momenteel uitgeschakeld");
  };

  public query ({ caller }) func getFavoriteOffers() : async [FolderOffer] {
    checkUser(caller);
    let profile = getUserProfileInternal(caller);
    let supermarketMatches = Set.fromArray<Supermarket>(profile.preferredSupermarkets);
    let categoryMatches = Set.fromArray<ProductCategory>(profile.preferredCategories);
    offers.values().toArray().filter(
      func(offer) {
        offer.offerType == #onePlusOneFree
        and offer.valid
        and (supermarketMatches.contains(offer.supermarket) or categoryMatches.contains(offer.category))
      }
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkUser(caller);
    // Users can only view their own profile unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUser(caller);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadProfilePhoto(photo : Storage.ExternalBlob) : async () {
    checkUser(caller);
    let profile = getUserProfileInternal(caller);
    let updatedProfile = { profile with profilePhoto = ?photo };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func removeProfilePhoto() : async () {
    checkUser(caller);
    let profile = getUserProfileInternal(caller);
    let updatedProfile = { profile with profilePhoto = null };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addFavoriteOffer(offerId : Nat) : async () {
    checkUser(caller);
    validateOfferExists(offerId);
    switch (favorites.get(caller)) {
      case (null) {
        let newFavorites = Set.empty<Nat>();
        newFavorites.add(offerId);
        favorites.add(caller, newFavorites);
      };
      case (?existing) { existing.add(offerId) };
    };
  };

  public shared ({ caller }) func removeFavoriteOffer(offerId : Nat) : async () {
    checkUser(caller);
    let favoriteSet = getFavoriteSetInternal(caller);
    if (not favoriteSet.contains(offerId)) {
      Runtime.trap("Invalid operation: Offer is not in your favorites");
    };
    favoriteSet.remove(offerId);
    favorites.add(caller, favoriteSet);
  };

  public query ({ caller }) func getUserFavorites(user : Principal) : async [FolderOffer] {
    checkUser(caller);
    // Users can only view their own favorites unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own favorites");
    };
    let favoriteSet = switch (favorites.get(user)) {
      case (null) { Set.empty<Nat>() };
      case (?set) { set };
    };
    let offersArray = offers.values().toArray();
    offersArray.filter(func(offer) { favoriteSet.contains(offer.id) });
  };

  public shared ({ caller }) func addMultipleFavoriteOffers(offerIds : [Nat]) : async () {
    checkUser(caller);
    for (id in offerIds.values()) {
      validateOfferExists(id);
    };
    for (id in offerIds.values()) {
      await addFavoriteOffer(id);
    };
  };

  public query ({ caller }) func getFavoriteOfferIds() : async [Nat] {
    checkUser(caller);
    switch (favorites.get(caller)) {
      case (null) { [] };
      case (?set) { set.values().toArray() };
    };
  };

  public shared ({ caller }) func addUserSelectedProducts(productIds : [Nat]) : async () {
    checkUser(caller);
    for (productId in productIds.values()) {
      validateOfferExists(productId);
    };
    let uniqueProducts = Set.empty<Nat>();
    for (productId in productIds.values()) {
      uniqueProducts.add(productId);
    };
    let productList = List.empty<Nat>();
    for (productId in uniqueProducts.values()) {
      productList.add(productId);
    };
    let userProductSet = switch (userProducts.get(caller)) {
      case (null) { Set.empty<Nat>() };
      case (?set) { set };
    };
    for (productId in productList.values()) {
      userProductSet.add(productId);
      await createProductMatches(caller, productId);
    };
    userProducts.add(caller, userProductSet);
  };

  public query ({ caller }) func getUserSelectedProducts(user : Principal) : async [FolderOffer] {
    checkUser(caller);
    // Users can only view their own selected products unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own selected products");
    };
    let productSet = switch (userProducts.get(user)) {
      case (null) { return [] };
      case (?set) { set };
    };
    productIdsToOffers(productSet);
  };

  public query ({ caller }) func getProductMatches(user : Principal) : async [Match] {
    checkUser(caller);
    // Users can only view their own product matches unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own product matches");
    };
    matches.values().toArray().filter(
      func(m) {
        m.user1 == user or m.user2 == user
      }
    );
  };

  public query ({ caller }) func getProductMatchesForUser(user : Principal) : async [Match] {
    checkUser(caller);
    // Users can only view their own product matches unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own product matches");
    };
    matches.values().toArray().filter(
      func(m) {
        m.user1 == user or m.user2 == user
      }
    );
  };

  public query ({ caller }) func getUserProductOverview(user : Principal) : async UserProductOverview {
    checkUser(caller);
    // Users can only view their own product overview unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own product overview");
    };
    let productSet = switch (userProducts.get(user)) {
      case (null) { Set.empty<Nat>() };
      case (?set) { set };
    };
    let onlyCurrentUser = List.empty<SelectedProductDetail>();
    let sharedProducts = List.empty<SelectedProductDetail>();

    for (productId in productSet.values()) {
      switch (offers.get(productId)) {
        case (?offer) {
          let matchedUsers = findMatchedUsers(user, productId);
          if (matchedUsers.size() > 0) {
            let sharedDetail : SelectedProductDetail = {
              product = offer;
              matchedUsers;
            };
            sharedProducts.add(sharedDetail);
          } else {
            let currentUserDetail : SelectedProductDetail = {
              product = offer;
              matchedUsers = [];
            };
            onlyCurrentUser.add(currentUserDetail);
          };
        };
        case (null) { () };
      };
    };
    {
      onlyCurrentUser = onlyCurrentUser.toArray();
      sharedProducts = sharedProducts.toArray();
    };
  };

  public query ({ caller }) func getUserNotifications() : async [Notification] {
    checkUser(caller);
    // Users can only view their own notifications
    notifications.values().toArray().filter(
      func(notification) {
        notification.user == caller
      }
    );
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    checkUser(caller);
    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) { n };
    };
    // Users can only mark their own notifications as read
    if (notification.user != caller) {
      Runtime.trap("Unauthorized: Only the invited participant can respond to this invitation");
    };
    let updatedNotification = {
      notification with isRead = true;
    };
    notifications.add(notificationId, updatedNotification);
  };

  // =====================================================================
  // PAYMENT AND REVIEW FUNCTIONS (USER-ONLY)
  // =====================================================================

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    checkUser(caller);
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    checkUser(caller);
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func createSharedPaymentInvitation(participant : Principal, offerId : Nat, amount : Float, paymentMethod : PaymentMethod) : async Nat {
    checkUser(caller);

    if (participant == caller) {
      Runtime.trap("Cannot create shared payment with yourself");
    };

    // Verify participant is also a user
    checkUser(participant);
    validateOfferExists(offerId);

    if (amount <= 0.0) {
      Runtime.trap("Amount must be positive");
    };

    let invitationId = nextInvitationId;
    nextInvitationId += 1;

    let invitation : SharedPaymentInvitation = {
      id = invitationId;
      initiator = caller;
      participant;
      offerId;
      amount;
      paymentMethod;
      status = #pending;
      createdAt = Time.now();
    };

    paymentInvitations.add(invitationId, invitation);
    invitationId;
  };

  public shared ({ caller }) func respondToPaymentInvitation(invitationId : Nat, accept : Bool) : async () {
    checkUser(caller);

    let invitation = switch (paymentInvitations.get(invitationId)) {
      case (null) { Runtime.trap("Invitation not found") };
      case (?inv) { inv };
    };

    // Only the invited participant can respond
    if (invitation.participant != caller) {
      Runtime.trap("Unauthorized: Only the invited participant can respond to this invitation");
    };

    if (invitation.status != #pending) {
      Runtime.trap("Invitation has already been responded to");
    };

    let newStatus = if (accept) { #accepted } else { #rejected };
    let updatedInvitation = {
      invitation with status = newStatus;
    };

    paymentInvitations.add(invitationId, updatedInvitation);

    if (accept) {
      let paymentId = nextPaymentId;
      nextPaymentId += 1;

      let payment : SharedPayment = {
        invitationId;
        initiator = invitation.initiator;
        participant = invitation.participant;
        offerId = invitation.offerId;
        amount = invitation.amount;
        paymentMethod = invitation.paymentMethod;
        completed = false;
      };

      sharedPayments.add(paymentId, payment);
    };
  };

  public query ({ caller }) func getSharedOfferPayments(user : Principal) : async [SharedPayment] {
    checkUser(caller);
    // Users can only view their own shared payments unless they are admin
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own shared payments");
    };
    sharedPayments.values().toArray().filter(
      func(payment) {
        payment.initiator == user or payment.participant == user
      }
    );
  };

  public shared ({ caller }) func leaveReview(toUser : Principal, sharedPaymentId : Nat, rating : Nat, comment : ?Text) : async () {
    checkUser(caller);

    // Verify the user being reviewed is also a user
    checkUser(toUser);

    if (caller == toUser) {
      Runtime.trap("Self reviews are not allowed");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid review: Rating must be between 1 and 5");
    };

    let payment = switch (sharedPayments.get(sharedPaymentId)) {
      case (null) { Runtime.trap("Payment not found for this review") };
      case (?payment) { payment };
    };

    if (not payment.completed) {
      Runtime.trap("Unauthorized: Reviews can only be left for completed payments");
    };

    // Only participants in the payment can review each other
    if (caller != payment.initiator and caller != payment.participant) {
      Runtime.trap("Unauthorized: Only participants in this payment can review each other");
    };

    let expectedOtherParticipant = if (caller == payment.initiator) {
      payment.participant
    } else {
      payment.initiator
    };

    if (toUser != expectedOtherParticipant) {
      Runtime.trap("Unauthorized: Can only review the other participant in this payment");
    };

    // Check for duplicate reviews
    switch (userReviews.get(toUser)) {
      case (?existing) {
        for (existingReview in existing.reviews.values()) {
          if (existingReview.reviewer == caller and existingReview.sharedPaymentId == sharedPaymentId) {
            Runtime.trap("You have already reviewed this user for this payment");
          };
        };
      };
      case (null) {};
    };

    let review : Review = {
      reviewer = caller;
      rating;
      comment;
      timestamp = Time.now();
      sharedPaymentId;
    };

    let newUserReviews = switch (userReviews.get(toUser)) {
      case (null) {
        {
          reviews = [review];
          averageRating = rating.toFloat();
          reviewCount = 1;
        };
      };
      case (?existing) {
        let newCount = existing.reviewCount + 1;
        let newAverage = ((existing.averageRating * existing.reviewCount.toFloat()) + rating.toFloat()) / newCount.toFloat();
        {
          reviews = existing.reviews.concat([review]);
          averageRating = newAverage;
          reviewCount = newCount;
        };
      };
    };

    userReviews.add(toUser, newUserReviews);
  };

  // =====================================================================
  // ADMIN-ONLY FUNCTIONS
  // =====================================================================

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    checkAdmin(caller);
    configuration := ?config;
  };

  public shared ({ caller }) func fetchOffersFromAlbertHeijn() : async () {
    checkAdmin(caller);

    let staticOffers : [FolderOffer] = [
      {
        id = 1;
        productName = "Appels";
        originalPrice = 2.5;
        supermarket = #albertHeijn;
        category = #groentenFruit;
        brand = ?("AH");
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://appieimages.ah.nl/generated/product/512x512/99465_gwn_api-snoepappel-4-stuks--zak-zak.png");
        offerType = #onePlusOneFree;
        valid = true;
      },
      {
        id = 2;
        productName = "Biologische Melk";
        originalPrice = 1.2;
        supermarket = #albertHeijn;
        category = #zuivel;
        brand = ?("Campina");
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://appieimages.ah.nl/generated/product/512x512/99465_gwn_api-biologische-melk-1-liter-karton-karton.png");
        offerType = #onePlusOneFree;
        valid = true;
      },
    ];
    for (offer in staticOffers.values()) {
      offers.add(offer.id, offer);
    };
  };

  public shared ({ caller }) func fetchOffersFromJumbo() : async () {
    checkAdmin(caller);

    let staticOffers : [FolderOffer] = [
      {
        id = 3;
        productName = "Bosbessen";
        originalPrice = 3.99;
        supermarket = #jumbo;
        category = #groentenFruit;
        brand = null;
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://jumbo-images-poc.gumstack.dev/lotus/90a98b55-8828-4d8b-bdd6-df08fec0b1a3_bosbessen_200_gram-jumbo_r_8718452394411-front.png");
        offerType = #onePlusOneFree;
        valid = true;
      },
      {
        id = 4;
        productName = "Jumbo Volkorenbrood";
        originalPrice = 2.3;
        supermarket = #jumbo;
        category = #bakkerij;
        brand = ?("Jumbo");
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://jumboimages.ah.nl/generated/product/512x512/99234_gwn_api-jumbo-volkorenbrood-800g-papier-8718452394411-front.jpg");
        offerType = #onePlusOneFree;
        valid = true;
      },
    ];
    for (offer in staticOffers.values()) {
      offers.add(offer.id, offer);
    };
  };

  public shared ({ caller }) func fetchOffersFromLidl() : async () {
    checkAdmin(caller);
    let staticOffers : [FolderOffer] = [
      {
        id = 5;
        productName = "Yoghurt";
        originalPrice = 0.7;
        supermarket = #lidl;
        category = #zuivel;
        brand = ?("Milbona");
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://www.lidlonline.be/-/media/public/lidlbe/files/imagecache/product_detailed_page/1/2/2/8/product_select_3521_img_1.jpg");
        offerType = #onePlusOneFree;
        valid = true;
      },
      {
        id = 6;
        productName = "Rundergehakt";
        originalPrice = 5.0;
        supermarket = #lidl;
        category = #vlees;
        brand = ?("Lidl");
        validFrom = Time.now();
        validUntil = Time.now() + (86400 * 7);
        imageUrl = sanitizeImageUrl("https://www.lidlonline.be/-/media/public/lidlbe/files/imagecache/product_detailed_page/2/3/2/0/vlees_vleeswaren_en_vis_dimdorrg.jpg");
        offerType = #onePlusOneFree;
        valid = true;
      },
    ];
    for (offer in staticOffers.values()) {
      offers.add(offer.id, offer);
    };
  };

  public shared ({ caller }) func restart() : async () {
    checkAdmin(caller);

    offers.clear();
    await fetchOffersFromAlbertHeijn();
    await fetchOffersFromJumbo();
    await fetchOffersFromLidl();

    paymentInvitations.clear();
    sharedPayments.clear();
    matches.clear();
    notifications.clear();
    favorites.clear();
    userProducts.clear();
  };

  // =====================================================================
  // INTERNAL HELPER FUNCTIONS
  // =====================================================================
  func checkUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func checkAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func isAdmin(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  func getFavoriteSetInternal(user : Principal) : Set.Set<Nat> {
    switch (favorites.get(user)) {
      case (null) { Set.empty<Nat>() };
      case (?set) { set };
    };
  };

  func getUserProfileInternal(user : Principal) : UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  func sanitizeImageUrlHelper(imageUrl : Text) : Text {
    if (imageUrl == "" or imageUrl.contains(#text("["))) {
      EMPTY_IMAGE_URL;
    } else {
      imageUrl;
    };
  };

  func productIdsToOffers(productIds : Set.Set<Nat>) : [FolderOffer] {
    let tempOffers = List.empty<FolderOffer>();
    for (productId in productIds.values()) {
      switch (offers.get(productId)) {
        case (?offer) { tempOffers.add(offer) };
        case (null) {};
      };
    };
    tempOffers.toArray();
  };

  func contains(array : [Principal], element : Principal) : Bool {
    array.find(func(x) { x == element }) != null;
  };

  func createProductMatches(currentUser : Principal, productId : Nat) : async () {
    await createMatchesWithExistingUsers(currentUser, productId);
    createProductNotifications(currentUser, productId, [currentUser]);
  };

  func createMatchesWithExistingUsers(currentUser : Principal, productId : Nat) : async () {
    for (otherUser in userProducts.keys()) {
      if (otherUser != currentUser) {
        let userProductSet = switch (userProducts.get(otherUser)) {
          case (null) { Set.empty<Nat>() };
          case (?set) { set };
        };
        if (userProductSet.contains(productId)) {
          matches.add(
            matchCounter,
            {
              user1 = currentUser;
              user2 = otherUser;
              offerId = productId;
              createdAt = Time.now();
            },
          );
          matchCounter += 1;
        };
      };
    };
  };

  func createProductNotifications(currentUser : Principal, productId : Nat, excludeList : [Principal]) {
    for (otherUser in userProducts.keys()) {
      if (otherUser != currentUser and not contains(excludeList, otherUser)) {
        let userProductSet = switch (userProducts.get(otherUser)) {
          case (null) { Set.empty<Nat>() };
          case (?set) { set };
        };
        if (userProductSet.contains(productId)) {
          let currentUserNotification : Notification = {
            id = notificationCounter;
            user = currentUser;
            notificationType = #productMatch {
              matchedUser = otherUser;
              offerId = productId;
            };
            isRead = false;
            createdAt = Time.now();
          };
          notificationCounter += 1;
          notifications.add(currentUserNotification.id, currentUserNotification);

          let otherUserNotification : Notification = {
            id = notificationCounter;
            user = otherUser;
            notificationType = #productMatch {
              matchedUser = currentUser;
              offerId = productId;
            };
            isRead = false;
            createdAt = Time.now();
          };
          notificationCounter += 1;
          notifications.add(otherUserNotification.id, otherUserNotification);
        };
      };
    };
  };

  func findMatchedUsers(user : Principal, productId : Nat) : [Principal] {
    let matchedList = List.empty<Principal>();

    for (otherUser in userProducts.keys()) {
      if (otherUser != user) {
        let products = switch (userProducts.get(otherUser)) {
          case (null) { Set.empty<Nat>() };
          case (?set) { set };
        };

        if (products.contains(productId)) {
          matchedList.add(otherUser);
        };
      };
    };

    matchedList.toArray();
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (configuration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  func validateOfferExists(offerId : Nat) {
    switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?_) {};
    };
  };

  var configuration : ?Stripe.StripeConfiguration = null;
};

