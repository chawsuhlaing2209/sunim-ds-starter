# Composition — what depends on what

`Composes` records that one component imports another. The engineer writes it in the
same pass that writes the import, and `Composed Into` is its automatic reverse.

Read it in reverse and it answers the one question no other column can: **if this
component changes, who has to be re-tested.** Without it, a repair to a low-level
component leaves every consumer reading `Completed` at 100%, tested against a
version that no longer exists underneath them, with nothing anywhere to say so.

Two things it is not. It is **not a category** — the design file's taxonomy is
positional, and an atom may compose a lower atom and remain an atom. And it is not
yet wired into `Development`: nothing derives from it, so a stale consumer is
something the sweep must notice, not something a formula will catch.
