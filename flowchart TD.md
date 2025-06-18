flowchart TD
    A[User Submits Login Credentials] --> B{Validate Input Format}
    B -->|Invalid| C[Return 400 Bad Request]
    B -->|Valid| D[Query User from Database]
    
    D --> E{User Exists?}
    E -->|No| F[Return 401 Unauthorized]
    E -->|Yes| G[Hash Submitted Password]
    
    G --> H{Compare Password Hashes}
    H -->|No Match| I[Log Failed Attempt]
    I --> J{Max Attempts Exceeded?}
    J -->|Yes| K[Lock Account/Rate Limit]
    K --> L[Return 429 Too Many Requests]
    J -->|No| F
    
    H -->|Match| M[Generate JWT/Session Token]
    M --> N[Store Session in Database/Cache]
    N --> O[Set Secure HTTP-Only Cookie]
    O --> P[Return 200 Success + User Data]
    
    Q[Protected Route Request] --> R{Token Present?}
    R -->|No| S[Return 401 Unauthorized]
    R -->|Yes| T[Extract Token]
    
    T --> U{Token Valid & Not Expired?}
    U -->|No| V[Return 401 Unauthorized]
    U -->|Yes| W[Verify Token Signature]
    
    W --> X{Signature Valid?}
    X -->|No| Y[Return 401 Unauthorized]
    X -->|Yes| Z[Extract User ID from Token]
    
    Z --> AA[Query User from Database]
    AA --> BB{User Still Active?}
    BB -->|No| CC[Return 403 Forbidden]
    BB -->|Yes| DD[Proceed to Protected Resource]
    
    EE[Logout Request] --> FF[Invalidate Token/Session]
    FF --> GG[Clear Cookies]
    GG --> HH[Return 200 Success]
    
    II[Token Refresh Request] --> JJ{Refresh Token Valid?}
    JJ -->|No| KK[Return 401 Unauthorized]
    JJ -->|Yes| LL[Generate New Access Token]
    LL --> MM[Return New Token]
    
    style A fill:#e1f5fe
    style P fill:#c8e6c9
    style DD fill:#c8e6c9
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style L fill:#ffcdd2
    style S fill:#ffcdd2
    style V fill:#ffcdd2
    style Y fill:#ffcdd2
    style CC fill:#ffcdd2
    style KK fill:#ffcdd2