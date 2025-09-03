from app.schemas.request import RiskInputsSchema

def calculate_risk_score(risk_inputs: RiskInputsSchema) -> int:
    """
    Calcula el risk_score basado en reglas de negocio.
    """
    score = 0

    # Regla 1: Si pep_flag es verdadero, suma 60 puntos.
    if risk_inputs.pep_flag:
        score += 60

    # Regla 2: Si sanction_list es verdadero, suma 40 puntos.
    if risk_inputs.sanction_list:
        score += 40

    # Regla 3: Suma 10 puntos por cada pago atrasado.
    late_payments_score = risk_inputs.late_payments * 10
    score += min(late_payments_score, 30) # Tope de 30 puntos

    return score