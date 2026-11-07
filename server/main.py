import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from models import Base, engine, User, Report
from auth import get_db, get_password_hash, verify_password, create_access_token, oauth2_scheme, jwt, SECRET_KEY, ALGORITHM, JWTError
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    username: str
    password: str

class ReportCreate(BaseModel):
    campaign_name: str
    platform: str
    views: int
    likes: int
    comments: int
    shares: int
    total_paid: float
    hook_retention: float = 48.5
    drop_off_rate: float = 22.1
    diagram_markup: str = "graph TD\n  A[Views] -->|Hook Retention 48.5%| B[Engagement]\n  B -->|CPE $0.14| C[Brand ROI]"

class ScreenshotAnalyzeRequest(BaseModel):
    image_base64: str
    platform: str = "TikTok"

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Signup attempt for user: {user.username}")
    try:
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            print(f"Signup failed: User {user.username} already exists")
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_password = get_password_hash(user.password)
        new_user = User(username=user.username, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Signup successful for user: {user.username}")
        return {"message": "User created successfully"}
    except Exception as e:
        print(f"Error during signup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/reports")
def create_report(report: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_report = Report(**report.dict(), user_id=current_user.id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@app.post("/analyze-screenshot")
def analyze_screenshot(req: ScreenshotAnalyzeRequest, current_user: User = Depends(get_current_user)):
    """
    Multimodal Vision API endpoint using Claude 3.5 Sonnet simulation / extraction
    to analyze platform analytics screenshots and return structured campaign metrics.
    """
    try:
        # Simulate high-precision OCR & Vision extraction from screenshot base64
        # In production, this passes req.image_base64 to anthropic.Anthropic().messages.create with vision block.
        simulated_metrics = {
            "campaign_name": f"{req.platform} Viral Growth Q4",
            "platform": req.platform,
            "views": 248500,
            "likes": 32100,
            "comments": 1420,
            "shares": 4850,
            "total_paid": 1250.0,
            "hook_retention": 64.2,
            "drop_off_rate": 18.5,
            "diagram_markup": f"graph TD\n  A[Total Views: 248,500] -->|Hook Retention 64.2%| B[Engagement: 38,370]\n  B -->|CPE $0.03| C[Brand Conversion ROI]"
        }
        return simulated_metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")

@app.get("/reports/{report_id}")
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/reports")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Report).filter(Report.user_id == current_user.id).all()


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

