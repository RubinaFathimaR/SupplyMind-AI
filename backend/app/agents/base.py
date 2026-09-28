import time
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.domain import AgentLog

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def log_activity(self, db: Session, action: str, reasoning: str, input_data: Dict[str, Any], output_data: Dict[str, Any], exec_time_ms: float):
        log_entry = AgentLog(
            agent_name=self.name,
            action=action,
            reasoning=reasoning,
            input_data=input_data,
            output_data=output_data,
            execution_time_ms=round(exec_time_ms, 2),
            timestamp=datetime.datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        return log_entry

    def run(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        result = self.execute(db, input_data)
        elapsed_ms = (time.time() - start_time) * 1000.0
        
        self.log_activity(
            db=db,
            action=result.get("action", f"Analyzed {input_data.get('supplier_name', 'Input Data')}"),
            reasoning=result.get("reasoning", f"Executed bounded evaluation for {self.name}."),
            input_data=input_data,
            output_data=result,
            exec_time_ms=elapsed_ms
        )
        return result

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute method.")
