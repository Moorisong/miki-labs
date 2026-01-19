# 🎯 뽑기중독 (Ppopgi Addict) - 프로젝트 개요

## 1. 프로젝트 목표
* **핵심 목표**: 웹에서 실제 인형뽑기의 조작감과 재미를 최대한 재현
* **체감 기준**: 물리 엔진(80%) + 연출 및 확률 조작(20%)의 조화
* **초기 범위**: 핵심 게임 플레이 + 로그인 + 랭킹 시스템
* **기타**: SEO 고려 (검색 및 공유 시 노출 최적화)

## 2. 기본 정보
* **서비스명**: 뽑기중독 (Ppopgi Addict)
* **Repository**: `ppopgi-addict`

## 3. 기술 스택 (Tech Stack)

### Frontend
* **Core**: Next.js (App Router)
* **3D Graphics**: three.js
* **Physics**: cannon-es
* **State Management**: useState 또는 zustand (최소화)

### Backend
* **Runtime**: Node.js
* **Framework**: Express
* **Database**: MongoDB (mongoose)
* **Auth**: OAuth (Kakao, Google - 식별 목적)

## 4. SEO 전략
* **프레임워크**: Next.js 활용
* **SSR 대상**: 
  - `/` (메인/소개)
  - `/ranking` (랭킹)
  - `/about` (설명)
* **CSR 대상**: 
  - `/game` (three.js 게임 플레이, `'use client'` 필수)

## 5. 확장 계획 (Future)
* 코인 시스템 및 BM 도입
* 서버 기반 확률 제어
* 이벤트 랭킹전
* 3D 리플레이 공유 기능

> **핵심 요약**: Next.js + three.js로 구현하는 "리얼한" 웹 인형뽑기. 초기에는 로그인/랭킹/게임플레이에 집중.
