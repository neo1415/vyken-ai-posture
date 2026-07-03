# Admin RBAC Matrix

Schema enum: `admin_role` → `viewer`, `editor`, `superadmin`

PRD mapping:

| PRD role | Schema role | Label in UI |
|----------|-------------|-------------|
| Analyst / reviewer | `viewer` | Reviewer |
| Admin | `editor` | Admin |
| Owner | `superadmin` | Owner |

## Permissions

| Action | viewer | editor | superadmin |
|--------|--------|--------|------------|
| View lead list | Yes | Yes | Yes |
| View lead detail | Yes | Yes | Yes |
| Update lead status | No | Yes | Yes |
| Send report email | No | Yes | Yes |
| Resend report email | No | Yes | Yes |
| View tool list/detail | Yes | Yes | Yes |
| Create/edit tool profiles | No | Yes | Yes |
| Publish/unpublish profiles | No | Yes | Yes |
| View email/event status | Yes | Yes | Yes |

## Enforcement layers

1. `src/server/admin/admin-permissions.ts` — permission helpers
2. `src/features/admin-auth/actions.ts` — action-level guards
3. `src/server/services/admin-dashboard.service.ts` — service-level checks
4. `src/server/services/tool-admin.service.ts` — service-level checks
5. Admin UI — hides write controls for `viewer`
