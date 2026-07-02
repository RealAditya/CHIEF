# CHIEF Architecture Specification

Version: 1.0
Codename: Genesis

---

# Mission

CHIEF is a privacy-first Personal Operations Platform.

It is NOT an AI chatbot.

It is NOT a task manager.

It is NOT a calendar application.

CHIEF is an operating platform that coordinates personal information through modular services.

Artificial Intelligence is only used where reasoning is required.

Everything else is deterministic software.

---

# Core Philosophy

Everything in CHIEF is either:

• A Module
• An Event
• A Service

Nothing else exists.

---

# High Level Architecture

                Frontend
                    │
             REST / WebSocket
                    │
               FastAPI Core
                    │
        ┌───────────┼────────────┐
        │           │            │
 Module Registry  Event Bus   Scheduler
        │           │            │
        └─────── Core Services ──┘
                    │
        ┌───────────┼────────────┐
        │           │            │
     Calendar    Booking      Finance
        │           │            │
        └───────────┼────────────┘
                    │
              PostgreSQL

Optional

Redis

AI Worker

Ollama

Notification Worker

Email Worker

Package Worker

---

# Core

The Core is responsible for:

• Loading modules

• Publishing events

• Scheduling jobs

• Configuration

• Logging

• Authentication

The Core DOES NOT know:

• What a booking is

• What a refund is

• What a package is

---

# Module Registry

Every module registers itself during startup.

Each module exposes:

Name

Version

Permissions

Dependencies

Routes

Events

Lifecycle hooks

---

# Event Bus

Every interaction happens through Events.

Example

booking_created

↓

Calendar updates

↓

Reminder created

↓

Notification sent

No module calls another module directly.

---

# Scheduler

Responsible for:

Timers

Recurring jobs

Retry jobs

Delayed events

No module creates its own scheduler.

---

# Database

Single PostgreSQL instance.

Each module owns its own tables.

Modules NEVER directly access another module's tables.

---

# AI Worker

The AI Worker is an independent service.

Responsibilities:

Email understanding

Summarization

Recommendations

Text extraction

Draft generation

The AI Worker never:

Updates the database directly

Schedules jobs

Calls modules

Deletes data

It only returns structured responses.

---

# Frontend

The homepage is the Calendar.

Everything appears as Events.

The sidebar is generated dynamically from installed modules.

---

# Modules

Each module owns one domain.

Booking Module

Calendar Module

Finance Module

Health Module

Travel Module

Security Module

Study Module

Package Module

Email Module

etc.

Modules can be installed or removed independently.

---

# Communication Rules

Module

↓

Publishes Event

↓

Core Event Bus

↓

Subscribers react

Never

Module

↓

Direct Module Call

---

# Logging

Everything important is logged.

Every Event

Every Error

Every State Change

---

# Configuration

Environment variables.

No secrets inside code.

---

# Security

Least privilege.

Modules receive only permissions they need.

No module receives unrestricted access.

---

# AI Principle

AI augments software.

AI never replaces software.

---

# Guiding Rule

If deterministic software can solve a problem,

AI must not be used.