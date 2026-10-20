# Database con SQLAlchemy 2 e SQLite

**Idea.** FastAPI non impone un ORM.
SQLAlchemy 2 è una scelta diffusa.
Una sessione database per richiesta aiuta a isolare transazioni e connessioni.

**Prima di leggere il codice — simboli e termini:**

- **`Annotated[T, ...]`**: mantiene il tipo `T` e aggiunge metadati usati da FastAPI.
- **`Depends(...)`**: dichiara una dipendenza costruita o risolta per la richiesta.
- **`yield` nelle dipendenze**: mette a disposizione la risorsa e ne permette la pulizia al termine della richiesta.

## Prima del codice: cosa riconoscere

`Session` è l’unità di lavoro col database, non una connessione da conservare globalmente. `select(Model)` costruisce una query; `session.commit()` rende persistenti le modifiche nella transazione.

```python
# Installare: pip install sqlalchemy
from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

engine = create_engine('sqlite:///./tasks.db', connect_args={'check_same_thread': False})

class Base(DeclarativeBase):
    pass

class Task(Base):
    __tablename__ = 'tasks'
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]

Base.metadata.create_all(engine) # solo demo: in produzione usa migrazioni

# La sessione usa un context manager per gestire la risorsa.
with Session(engine) as session:
    session.add(Task(title='Preparare fattura'))
    session.commit()
    # select(Task) costruisce una query ORM; scalars estrae le entità Task.
    tasks = session.scalars(select(Task)).all()
    print([task.title for task in tasks])
```

## In FastAPI

```python
from typing import Iterator
from fastapi import Depends

def get_session() -> Iterator[Session]:
    # La sessione usa un context manager per gestire la risorsa.
    with Session(engine) as session:
        # yield produce un valore e conserva lo stato del generatore.
        yield session
# nella route: session: Annotated[Session, Depends(get_session)]
```

**Attenzione:** il codice è sync (`def`) e usa SQLite in locale.  
Per PostgreSQL cambia driver/DSN; per migrazioni reali usa Alembic.  
Non usare sessioni globali condivise per tutte le richieste.
