import { signInWithPopup, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // 로그인 시 이전 사용자의 로컬 스토리지 데이터 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on login");

    // Firestore에 사용자 정보 저장/업데이트
    await saveUserToFirestore(user);

    return user;
  } catch (error) {
    console.error("Google 로그인 오류:", error);
    throw error;
  }
};

const saveUserToFirestore = async (user: User) => {
  const userRef = doc(db, "users", user.uid);

  try {
    // 기존 사용자 문서 확인
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // 기존 사용자: 로그인 횟수 증가 및 마지막 로그인 시간 업데이트
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: increment(1),
        email: user.email, // 이메일이 변경될 수 있으므로 업데이트
      });
    } else {
      // 신규 사용자: 새 문서 생성
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
      });
    }
  } catch (error) {
    console.error("Firestore 사용자 저장 오류:", error);
    throw error;
  }
};

// 이메일/비밀번호로 회원가입
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // 이메일 인증 메일 발송
    await sendEmailVerification(user);

    // Firestore에 사용자 정보 저장
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || "",
      photoURL: "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      loginCount: 0, // 이메일 인증 전이므로 0
      emailVerified: false, // 이메일 인증 여부
    });

    // 이메일 인증 전까지 로그인 불가 - 즉시 로그아웃
    await auth.signOut();

    // 로컬 스토리지 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on signup - waiting for email verification");

    return user;
  } catch (error) {
    console.error("이메일 회원가입 오류:", error);
    throw error;
  }
};

// 이메일/비밀번호로 로그인
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // 이메일 인증 확인
    if (!user.emailVerified) {
      await auth.signOut(); // 인증되지 않은 사용자는 로그아웃
      const error = new Error("Email not verified");
      (error as any).code = "auth/email-not-verified";
      throw error;
    }

    // 로그인 시 이전 사용자의 로컬 스토리지 데이터 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on login");

    // Firestore에 사용자 정보 업데이트
    await saveUserToFirestore(user);

    return user;
  } catch (error) {
    console.error("이메일 로그인 오류:", error);
    throw error;
  }
};

// 비밀번호 재설정 이메일 전송
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    throw error;
  }
};

// 이메일 링크로 회원가입 (비밀번호 없음)
export const signUpWithEmailLink = async (email: string, displayName?: string) => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/verify-email`, // 인증 후 리다이렉트될 URL
      handleCodeInApp: true, // 앱에서 코드 처리
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // 이메일을 로컬 스토리지에 저장 (나중에 인증 완료 시 사용)
    window.localStorage.setItem('emailForSignIn', email);
    if (displayName) {
      window.localStorage.setItem('displayNameForSignIn', displayName);
    }

    console.log("이메일 링크 발송 완료:", email);
  } catch (error) {
    console.error("이메일 링크 발송 오류:", error);
    throw error;
  }
};

// 이메일 링크로 로그인 완료 (인증 링크 클릭 후)
export const completeEmailLinkSignIn = async (emailLink: string) => {
  try {
    // 이메일 링크인지 확인
    if (!isSignInWithEmailLink(auth, emailLink)) {
      throw new Error("Invalid email link");
    }

    // 로컬 스토리지에서 이메일 가져오기
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      // 이메일이 없으면 사용자에게 입력 요청 (다른 기기에서 열었을 경우)
      email = window.prompt('확인을 위해 이메일 주소를 입력해주세요');
    }

    if (!email) {
      throw new Error("Email is required");
    }

    // 이메일 링크로 로그인
    const result = await signInWithEmailLink(auth, email, emailLink);
    const user = result.user;

    // 로컬 스토리지 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");

    // displayName 가져오기
    const displayName = window.localStorage.getItem('displayNameForSignIn');

    // Firestore에 사용자 정보 저장 (신규 사용자인 경우)
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 신규 사용자
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || "",
        photoURL: "",
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
        emailVerified: true, // 이메일 링크로 인증했으므로 true
      });
    } else {
      // 기존 사용자 (로그인)
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: increment(1),
      });
    }

    // 저장된 이메일과 displayName 제거
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('displayNameForSignIn');

    console.log("이메일 링크 로그인 완료:", user.email);
    return user;
  } catch (error) {
    console.error("이메일 링크 로그인 오류:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // 로그아웃 시 로컬 스토리지 초기화
    localStorage.removeItem("currentView");
    localStorage.removeItem("currentConversationId");
    localStorage.removeItem("currentProjectId");
    console.log("Cleared localStorage on logout");

    await auth.signOut();
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};
